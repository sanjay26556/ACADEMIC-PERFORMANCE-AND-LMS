import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, BrainCircuit, FileText, Shield, CheckCircle, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProctoredExamView from "./ProctoredExamView";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentAssessmentsView() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [assessmentDetails, setAssessmentDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [examActive, setExamActive] = useState(false);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const res = await fetch(`${API_URL}/assessments`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAssessments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            toast.error("Failed to load assessments");
        } finally {
            setLoading(false);
        }
    };

    const handleStartAssessment = async (assessment: any) => {
        setLoadingDetails(true);
        setSelectedAssessment(assessment);
        try {
            const res = await fetch(`${API_URL}/assessments/${assessment.id}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAssessmentDetails(data);
                setExamActive(true);
            } else {
                toast.error("Failed to fetch assessment details");
                setSelectedAssessment(null);
            }
        } catch (error) {
            toast.error("Error connecting to server");
            setSelectedAssessment(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleExitExam = () => {
        setExamActive(false);
        setSelectedAssessment(null);
        setAssessmentDetails(null);
        fetchAssessments(); // Refresh list
    };

    const renderIcon = (type: string) => {
        if (type === 'Coding') return <Code className="w-5 h-5 text-blue-400" />;
        if (type === 'MCQ') return <BrainCircuit className="w-5 h-5 text-purple-400" />;
        return <FileText className="w-5 h-5 text-orange-400" />;
    };

    const getStatusStyle = (status: string) => {
        if (status === 'Active') return 'bg-emerald-900/40 text-emerald-400 border-emerald-700';
        if (status === 'Completed') return 'bg-gray-800 text-gray-400 border-gray-600';
        return 'bg-blue-900/40 text-blue-400 border-blue-700';
    };

    // If exam is active, render proctored view fullscreen
    if (examActive && selectedAssessment && assessmentDetails) {
        return (
            <ProctoredExamView
                assessment={selectedAssessment}
                assessmentDetails={assessmentDetails}
                onExit={handleExitExam}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-blue-500" />
                        Assessments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        All assessments are proctored with webcam, audio, and activity monitoring.
                    </p>
                </div>
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-700 px-3 py-1 text-xs">
                    🔒 Secure Proctored Environment
                </Badge>
            </div>

            {/* Proctoring notice */}
            <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-300">
                    <span className="font-semibold text-blue-200">Proctoring is enforced.</span>{" "}
                    When you start an assessment, your webcam, microphone, and screen activity will be monitored.
                    Violations (tab switch, multiple faces, audio noise, etc.) are logged and reported to your teacher.
                    After <strong className="text-red-400">3 violations</strong>, your exam will be automatically terminated.
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : assessments.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    No active assessments available.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(a => {
                        const isCompleted = a.status === 'Completed' || a.submission_status === 'Submitted';
                        const isTerminated = a.submission_status === 'Terminated';
                        return (
                            <Card
                                key={a.id}
                                className={`group hover:shadow-xl transition-all duration-200 border-t-4 overflow-hidden ${
                                    isTerminated ? 'opacity-70 border-t-red-600' :
                                    isCompleted ? 'opacity-60 border-t-gray-500' :
                                    a.type === 'Coding' ? 'border-t-blue-500' :
                                    a.type === 'MCQ' ? 'border-t-purple-500' : 'border-t-orange-500'
                                }`}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant="outline" className={getStatusStyle(a.status)}>
                                            {a.status}
                                        </Badge>
                                        {renderIcon(a.type)}
                                    </div>
                                    <CardTitle className="text-base leading-tight">{a.title}</CardTitle>
                                    <p className="text-xs text-muted-foreground">via {a.assignment_title}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {a.timer_minutes} mins
                                        </span>
                                        <span className="font-semibold text-foreground">{a.total_marks} Marks</span>
                                    </div>

                                    {/* Proctoring indicators */}
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {[
                                            { icon: '📷', label: 'Webcam' },
                                            { icon: '🎤', label: 'Audio' },
                                            { icon: '🖥️', label: 'Screen' },
                                        ].map(p => (
                                            <span key={p.label} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                {p.icon} {p.label}
                                            </span>
                                        ))}
                                    </div>

                                    <Button
                                        className={`w-full ${
                                            isTerminated 
                                                ? 'bg-red-950 text-red-300 border border-red-800/50 cursor-not-allowed hover:bg-red-950'
                                                : isCompleted
                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed hover:bg-gray-700'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        }`}
                                        disabled={isCompleted || isTerminated || loadingDetails}
                                        onClick={() => !isCompleted && !isTerminated && handleStartAssessment(a)}
                                    >
                                        {loadingDetails && selectedAssessment?.id === a.id ? (
                                            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading...</>
                                        ) : isTerminated ? (
                                            <><Lock className="w-4 h-4 mr-2" /> Terminated - Awaiting Retest</>
                                        ) : isCompleted ? (
                                            <><CheckCircle className="w-4 h-4 mr-2" /> Submitted</>
                                        ) : (
                                            <><Shield className="w-4 h-4 mr-2" /> Start Exam</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
