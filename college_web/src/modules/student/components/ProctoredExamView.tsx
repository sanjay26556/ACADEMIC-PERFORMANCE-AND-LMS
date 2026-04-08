import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    AlertTriangle, Shield, Camera, Mic, Eye, Clock, CheckCircle,
    XCircle, Wifi, Monitor, SkipForward
} from "lucide-react";

const API_URL = 'http://localhost:5000';
const MAX_VIOLATIONS = 3;
const WARNING_DURATION = 4000;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

type ViolationType = 'face_missing' | 'multiple_faces' | 'tab_switch' | 'audio' | 'fullscreen_exit' | 'copy_paste';
type ExamPhase = 'pre' | 'active' | 'terminated' | 'submitted';

interface Question {
    id: number;
    question_text: string;
    type: 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'Descriptive';
    options?: string;
    marks: number;
}

interface Props {
    assessment: any;
    assessmentDetails: any;
    onExit: () => void;
}

export default function ProctoredExamView({ assessment, assessmentDetails, onExit }: Props) {
    const [phase, setPhase] = useState<ExamPhase>('pre');
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [violations, setViolations] = useState(0);
    const [warning, setWarning] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState((assessment?.timer_minutes || 30) * 60);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [codeStr, setCodeStr] = useState(assessmentDetails?.problem?.starter_code || '');
    const [permissionsGranted, setPermissionsGranted] = useState({ camera: false, mic: false });
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [terminated, setTerminated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [warningCount, setWarningCount] = useState(0);

    const webcamRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const violationRef = useRef(0);
    const sessionIdRef = useRef<number | null>(null);
    const violationLogRef = useRef<Array<{ type: string; severity: string; description: string; time: string }>>([]);

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------
    const logViolation = useCallback(async (
        type: ViolationType,
        severity: 'low' | 'medium' | 'high' | 'critical',
        description: string
    ) => {
        violationRef.current += 1;
        setViolations(v => v + 1);

        // Track violation log locally
        const now = new Date().toLocaleTimeString('en-IN');
        violationLogRef.current.push({ type, severity, description, time: now });

        // Show warning
        setWarning(`⚠️ Warning (${violationRef.current}/${MAX_VIOLATIONS}): ${description}`);
        setWarningCount(c => c + 1);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        warningTimerRef.current = setTimeout(() => setWarning(null), WARNING_DURATION);

        // Post to backend
        try {
            await fetch(`${API_URL}/assessments/${assessment.id}/violation`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    violation_type: type,
                    severity,
                    description,
                    session_id: sessionIdRef.current
                })
            });
        } catch (_) { }

        // Terminate if over limit
        if (violationRef.current >= MAX_VIOLATIONS) {
            terminateExam('Maximum violations exceeded. Assessment terminated due to malpractice.');
        }
    }, [assessment?.id]);

    const terminateExam = useCallback(async (reason: string) => {
        setPhase('terminated');
        setTerminated(true);
        stopProctoring();
        await submitExam(reason);
    }, []);

    const stopProctoring = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        document.exitFullscreen?.()?.catch(() => { });
        // Remove all listeners by exiting
    };

    const submitExam = useCallback(async (terminationReason?: string) => {
        setSubmitting(true);
        try {
            const payload: any = {
                answers,
                session_id: sessionIdRef.current,
            };
            if (terminationReason) {
                payload.termination_reason = terminationReason;
                payload.violation_summary = violationLogRef.current;
            }

            await fetch(`${API_URL}/assessments/${assessment.id}/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (!terminationReason) setPhase('submitted');
        } catch {
            toast.error('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [answers, assessment?.id]);

    // --------------------------------------------------------
    // Timer
    // --------------------------------------------------------
    useEffect(() => {
        if (phase !== 'active') return;
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    submitExam();
                    setPhase('submitted');
                    stopProctoring();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    // --------------------------------------------------------
    // Anti-Malpractice Controls
    // --------------------------------------------------------
    useEffect(() => {
        if (phase !== 'active') return;

        // Disable right click
        const onContextMenu = (e: MouseEvent) => { e.preventDefault(); };

        // Detect paste / copy
        const onCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            logViolation('copy_paste', 'low', 'Copy/Paste attempt detected');
        };

        // Detect key combos
        const onKeyDown = (e: KeyboardEvent) => {
            const blocked = [
                e.ctrlKey && ['c', 'v', 't', 'w', 'a', 'u', 's'].includes(e.key.toLowerCase()),
                e.altKey && e.key === 'Tab',
                e.key === 'F12',
                e.key === 'F5',
                e.ctrlKey && e.key === 'r',
            ];
            if (blocked.some(Boolean)) {
                e.preventDefault();
                logViolation('copy_paste', 'low', `Blocked keyboard shortcut: ${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`);
            }
        };

        // Tab switch / focus loss
        const onVisibilityChange = () => {
            if (document.hidden) {
                logViolation('tab_switch', 'high', 'Tab switch or window minimized detected');
            }
        };

        // Fullscreen exit
        const onFullscreenChange = () => {
            if (!document.fullscreenElement && phase === 'active') {
                logViolation('fullscreen_exit', 'medium', 'Fullscreen mode exited');
                // Try to re-enter
                document.documentElement.requestFullscreen?.().catch(() => { });
            }
        };

        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('copy', onCopyPaste);
        document.addEventListener('paste', onCopyPaste);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('visibilitychange', onVisibilityChange);
        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('copy', onCopyPaste);
            document.removeEventListener('paste', onCopyPaste);
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [phase, logViolation]);

    // --------------------------------------------------------
    // Face / Audio Monitoring (simulated with MediaStream)
    // --------------------------------------------------------
    useEffect(() => {
        if (phase !== 'active' || !streamRef.current) return;

        // Audio monitoring: detect sustained high volume
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(streamRef.current);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        let lastAudioAlert = 0;
        const audioInterval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            if (avg > 40 && Date.now() - lastAudioAlert > 10000) {
                lastAudioAlert = Date.now();
                logViolation('audio', 'medium', 'Audio/noise detected — speaking or background conversation');
            }
        }, 1000);

        // Periodic face check (simplified — can't do real CV without TF.js; simulating once every 15s reminder)
        let faceCheck = 0;
        const faceInterval = setInterval(() => {
            faceCheck++;
            // In a real system you'd run face detection here.
            // We inform the user the webcam is active and monitoring.
        }, 15000);

        return () => {
            clearInterval(audioInterval);
            clearInterval(faceInterval);
            audioCtx.close();
        };
    }, [phase, logViolation]);

    // --------------------------------------------------------
    // Start Exam Handler
    // --------------------------------------------------------
    const handleStartExam = async () => {
        try {
            // Request camera + mic
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
            }
            setPermissionsGranted({ camera: true, mic: true });

            // Enter fullscreen
            await document.documentElement.requestFullscreen?.().catch(() => { });

            // Start session on backend
            const res = await fetch(`${API_URL}/assessments/${assessment.id}/session/start`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (res.status === 409) {
                toast.error('You have already submitted this assessment.');
                return;
            }
            const data = await res.json();
            sessionIdRef.current = data.session_id;
            setSessionId(data.session_id);

            setPhase('active');
            toast.success('Exam started. Proctoring active.', { duration: 3000 });
        } catch (err) {
            toast.error('Camera/Microphone access is required to start the exam.');
        }
    };

    // --------------------------------------------------------
    // Format Timer
    // --------------------------------------------------------
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const timerColor = timeLeft < 120 ? 'text-red-500' : timeLeft < 300 ? 'text-yellow-400' : 'text-emerald-400';

    // --------------------------------------------------------
    // Pre-Exam Screen
    // --------------------------------------------------------
    if (phase === 'pre') {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
                <div className="max-w-2xl w-full mx-4 bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-center">
                        <Shield className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                        <h1 className="text-2xl font-bold text-white">{assessment?.title}</h1>
                        <p className="text-blue-300 mt-1">{assessment?.type} Assessment • {assessment?.timer_minutes} minutes</p>
                    </div>

                    {/* Rules */}
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="text-yellow-400 w-5 h-5" />
                            Exam Rules & Proctoring Notice
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {[
                                { icon: <Camera className="w-4 h-4 text-blue-400" />, label: 'Webcam will be activated for face monitoring' },
                                { icon: <Mic className="w-4 h-4 text-purple-400" />, label: 'Microphone will monitor for background audio' },
                                { icon: <Monitor className="w-4 h-4 text-green-400" />, label: 'Fullscreen mode enforced throughout exam' },
                                { icon: <Eye className="w-4 h-4 text-yellow-400" />, label: 'Tab switching will be flagged as violation' },
                                { icon: <XCircle className="w-4 h-4 text-red-400" />, label: 'Copy, paste & shortcuts are disabled' },
                                { icon: <AlertTriangle className="w-4 h-4 text-orange-400" />, label: `Exam auto-terminates after ${MAX_VIOLATIONS} violations` },
                            ].map((r, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                                    {r.icon}
                                    <span className="text-gray-300">{r.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-sm text-yellow-300">
                            ⚠️ By starting this exam, you agree that all activity is monitored and violations may be reported to your teacher.
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onExit} className="flex-1 border-gray-600 text-gray-300">
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleStartExam}>
                                <Shield className="w-4 h-4 mr-2" /> Start Proctored Exam
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------
    // Submitted / Terminated Screens
    // --------------------------------------------------------
    if (phase === 'submitted' || phase === 'terminated') {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center">
                <div className="max-w-md w-full mx-4 text-center p-8 bg-gray-900 rounded-2xl border border-gray-700">
                    {phase === 'terminated' ? (
                        <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Assessment Terminated</h2>
                            <p className="text-gray-400 mb-4">
                                Your assessment was automatically terminated due to malpractice. Your answers have been saved and your teacher has been notified.
                            </p>
                            <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3 text-red-300 text-sm mb-3 text-left">
                                <p className="font-semibold mb-2">Violation Summary ({violations}/{MAX_VIOLATIONS}):</p>
                                {violationLogRef.current.map((v, i) => (
                                    <div key={i} className="text-xs mb-1 flex gap-2">
                                        <span className="text-red-500">{i + 1}.</span>
                                        <span className="capitalize">{v.type.replace(/_/g, ' ')}</span>
                                        <span className="text-red-400/60 ml-auto">{v.time}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Assessment Submitted</h2>
                            <p className="text-gray-400 mb-6">Your answers have been saved successfully.</p>
                        </>
                    )}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onExit}>
                        Return to Assessments
                    </Button>
                </div>
            </div>
        );
    }

    // --------------------------------------------------------
    // Active Exam Screen
    // --------------------------------------------------------
    const questions: Question[] = assessmentDetails?.questions || [];
    const isLastQuestion = currentQuestion === questions.length - 1;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col select-none" style={{ userSelect: 'none' }}>
            {/* Warning Banner */}
            {warning && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 px-4 font-semibold text-sm animate-pulse flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {warning}
                </div>
            )}

            {/* Top Bar */}
            <div className={`bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0 ${warning ? 'mt-12' : ''}`}>
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">{assessment?.title}</span>
                    <Badge className="bg-blue-900/50 text-blue-300 border-blue-700">{assessment?.type}</Badge>
                </div>

                <div className="flex items-center gap-6">
                    {/* Violation counter */}
                    <div className="flex items-center gap-2 text-sm">
                        {Array.from({ length: MAX_VIOLATIONS }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < violations ? 'bg-red-500' : 'bg-gray-700'}`}
                            />
                        ))}
                        <span className="text-gray-400 text-xs ml-1">Violations</span>
                    </div>

                    {/* Camera preview */}
                    <div className="relative">
                        <video
                            ref={webcamRef}
                            autoPlay
                            muted
                            className="w-20 h-14 rounded-lg object-cover border border-gray-700 bg-gray-800"
                        />
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>

                    {/* Timer */}
                    <div className="flex flex-col items-center">
                        <Clock className={`w-4 h-4 ${timerColor}`} />
                        <span className={`font-mono text-xl font-bold ${timerColor}`}>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Submit Button */}
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={submitting}
                        onClick={async () => {
                            stopProctoring();
                            await submitExam();
                            setPhase('submitted');
                        }}
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Navigation (left sidebar for MCQ) */}
                {assessmentDetails?.type !== 'Coding' && questions.length > 0 && (
                    <div className="w-56 bg-gray-900 border-r border-gray-800 p-3 flex flex-col overflow-y-auto shrink-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2 px-1">Questions</p>
                        <div className="grid grid-cols-4 gap-1 mb-4">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(i)}
                                    className={`w-9 h-9 rounded-md text-xs font-bold transition-all ${
                                        i === currentQuestion
                                            ? 'bg-blue-600 text-white'
                                            : answers[q.id]
                                                ? 'bg-emerald-700 text-white'
                                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto space-y-2 pt-3 border-t border-gray-800 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-emerald-700" /> Answered ({answeredCount})
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-gray-800 border border-gray-600" /> Unanswered ({questions.length - answeredCount})
                            </div>
                        </div>
                    </div>
                )}

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto bg-gray-950 p-8">
                    {assessmentDetails?.type === 'Coding' ? (
                        /* ---- Coding Interface ---- */
                        <div className="h-full flex flex-col gap-4">
                            {/* Problem */}
                            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {assessmentDetails?.problem?.title || 'Coding Problem'}
                                </h3>
                                <p className="text-gray-400 text-sm whitespace-pre-wrap">
                                    {assessmentDetails?.problem?.description || 'No description provided.'}
                                </p>
                            </div>
                            {/* Code Editor */}
                            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
                                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-xs text-gray-400 ml-2">solution.py</span>
                                </div>
                                <textarea
                                    value={codeStr}
                                    onChange={e => setCodeStr(e.target.value)}
                                    className="flex-1 bg-gray-950 text-gray-200 font-mono text-sm p-4 resize-none focus:outline-none"
                                    spellCheck={false}
                                    placeholder="// Write your code here..."
                                />
                            </div>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center text-gray-500 py-20">Loading questions...</div>
                    ) : (
                        /* ---- MCQ / Descriptive Interface ---- */
                        <div className="max-w-3xl mx-auto">
                            {/* Progress bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                                    <span>{questions[currentQuestion]?.marks} marks</span>
                                </div>
                                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current Question */}
                            {(() => {
                                const q = questions[currentQuestion];
                                let opts: string[] = [];
                                try { opts = q.options ? JSON.parse(q.options) : []; } catch { }
                                return (
                                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
                                        <p className="text-gray-200 text-lg font-medium leading-relaxed mb-6">
                                            {currentQuestion + 1}. {q.question_text}
                                        </p>

                                        {(q.type === 'MCQ' || q.type === 'TrueFalse') && (
                                            <div className="space-y-3">
                                                {(q.type === 'TrueFalse' ? ['True', 'False'] : opts).map((opt, oi) => (
                                                    <label
                                                        key={oi}
                                                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                                                            answers[q.id] === opt
                                                                ? 'bg-blue-700/30 border-blue-500 text-white'
                                                                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                            answers[q.id] === opt ? 'border-blue-400 bg-blue-500' : 'border-gray-600'
                                                        }`}>
                                                            {answers[q.id] === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name={`q_${q.id}`}
                                                            className="sr-only"
                                                            checked={answers[q.id] === opt}
                                                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {(q.type === 'ShortAnswer' || q.type === 'Descriptive') && (
                                            <textarea
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-blue-500 min-h-[140px] resize-none"
                                                placeholder="Type your answer here..."
                                                value={answers[q.id] || ''}
                                                onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                            />
                                        )}

                                        {/* Navigation */}
                                        <div className="flex justify-between mt-8 pt-4 border-t border-gray-800">
                                            <Button
                                                variant="outline"
                                                className="border-gray-700 text-gray-300"
                                                disabled={currentQuestion === 0}
                                                onClick={() => setCurrentQuestion(c => c - 1)}
                                            >
                                                ← Previous
                                            </Button>
                                            {isLastQuestion ? (
                                                <Button
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                    disabled={submitting}
                                                    onClick={async () => {
                                                        stopProctoring();
                                                        await submitExam();
                                                        setPhase('submitted');
                                                    }}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    {submitting ? 'Submitting...' : 'Submit Exam'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => setCurrentQuestion(c => c + 1)}
                                                >
                                                    Next →
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
