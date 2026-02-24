import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, ArrowRight, ArrowLeft, Save, Calendar, Clock, AlertTriangle } from "lucide-react";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function AssessmentBuilder({ onSuccess }: { onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [assignments, setAssignments] = useState([]);

    // Basic Info State
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        assignment_id: "",
        type: "MCQ" as "MCQ" | "Coding" | "Subject",
        start_date: "",
        end_date: "",
    });

    // Content State (Questions)
    const [questions, setQuestions] = useState([
        { id: 1, question_text: "", type: "MCQ", options: ["", "", "", ""], correct_answer: "", marks: 5, negative_marks: 0 }
    ]);

    // Content State (Coding)
    const [codingProblem, setCodingProblem] = useState({
        title: "", description: "",
        allowed_languages: ["javascript", "python", "java", "cpp"],
        starter_code: "// Write your code here",
        marks: 100,
        evaluation_mode: "auto" as "auto" | "manual",
        test_cases: [{ input: "", expected_output: "", is_hidden: false }]
    });

    // Settings State
    const [settings, setSettings] = useState({
        timer_minutes: "30",
        total_marks: "100", // Auto-calculated usually, but editable
        attempts_allowed: "1",
        status: "Draft"
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${API_URL}/assignments`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) setAssignments(data);
        } catch (err) {
            console.error(err);
        }
    };

    // --- Steps Navigation ---
    const nextStep = () => {
        if (step === 1) {
            if (!basicInfo.title || !basicInfo.assignment_id) {
                toast.error("Please fill required fields");
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    // --- Handlers ---
    const updateQuestion = (id: number, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleSave = async (status: string = "Draft") => {
        setSaving(true);

        // Calculate total marks if MCQ/Subject
        let calculatedTotal = 0;
        if (basicInfo.type === 'MCQ' || basicInfo.type === 'Subject') {
            calculatedTotal = questions.reduce((acc, q) => acc + parseFloat(String(q.marks || 0)), 0);
        } else {
            calculatedTotal = parseFloat(String(codingProblem.marks || 0));
        }

        const payload = {
            ...basicInfo,
            assignment_id: parseInt(basicInfo.assignment_id),
            ...settings,
            status,
            total_marks: calculatedTotal,
            questions: (basicInfo.type === 'MCQ' || basicInfo.type === 'Subject') ? questions : undefined,
            coding_problem: basicInfo.type === 'Coding' ? codingProblem : undefined
        };

        try {
            const res = await fetch(`${API_URL}/assessments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success(`Assessment saved as ${status}!`);
                onSuccess();
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to save");
            }
        } catch (err) {
            toast.error("Error saving assessment");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-950 text-neutral-200">
            {/* Header / Stepper */}
            <div className="flex justify-between items-center pb-6 border-b border-neutral-800 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Assessment Wizard</h2>
                    <div className="flex gap-2 text-sm text-neutral-500 mt-1">
                        <span className={step >= 1 ? "text-emerald-500" : ""}>1. Basic Info</span>
                        <span>&gt;</span>
                        <span className={step >= 2 ? "text-emerald-500" : ""}>2. {basicInfo.type === 'Coding' ? 'Problem Problem' : 'Questions'}</span>
                        <span>&gt;</span>
                        <span className={step >= 3 ? "text-emerald-500" : ""}>3. Settings</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave("Draft")} disabled={saving}>
                        Save Draft
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSave("Scheduled")} disabled={saving}>
                        Publish
                    </Button>
                </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-6 max-w-2xl mx-auto w-full">
                    <div className="space-y-2">
                        <Label>Assessment Title <span className="text-red-500">*</span></Label>
                        <Input value={basicInfo.title} onChange={e => setBasicInfo({ ...basicInfo, title: e.target.value })} placeholder="e.g. Mid-Term Coding Exam" className="bg-neutral-900 border-neutral-700" />
                    </div>

                    <div className="space-y-2">
                        <Label>Linked Assignment <span className="text-red-500">*</span></Label>
                        <Select value={basicInfo.assignment_id} onValueChange={v => setBasicInfo({ ...basicInfo, assignment_id: v })}>
                            <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue placeholder="Select Assignment" /></SelectTrigger>
                            <SelectContent>
                                {assignments.map((a: any) => (
                                    <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Assessment Type <span className="text-red-500">*</span></Label>
                        <Select value={basicInfo.type} onValueChange={(v: any) => setBasicInfo({ ...basicInfo, type: v })}>
                            <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Coding">Coding Assessment</SelectItem>
                                <SelectItem value="MCQ">MCQ / Aptitude</SelectItem>
                                <SelectItem value="Subject">Subject (Theory)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input type="datetime-local" value={basicInfo.start_date} onChange={e => setBasicInfo({ ...basicInfo, start_date: e.target.value })} className="bg-neutral-900 border-neutral-700" />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input type="datetime-local" value={basicInfo.end_date} onChange={e => setBasicInfo({ ...basicInfo, end_date: e.target.value })} className="bg-neutral-900 border-neutral-700" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={nextStep} className="bg-white text-black hover:bg-neutral-200">
                            Next: {basicInfo.type === 'Coding' ? 'Problem Details' : 'Add Questions'} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Content (MCQ/Subject or Coding) */}
            {step === 2 && (
                <div className="flex flex-col h-full">
                    {basicInfo.type === 'Coding' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Problem Title</Label>
                                    <Input value={codingProblem.title} onChange={e => setCodingProblem({ ...codingProblem, title: e.target.value })} className="bg-neutral-900 border-neutral-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Marks</Label>
                                    <Input type="number" value={codingProblem.marks} onChange={e => setCodingProblem({ ...codingProblem, marks: parseInt(e.target.value) })} className="bg-neutral-900 border-neutral-700" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Problem Description</Label>
                                <Textarea value={codingProblem.description} onChange={e => setCodingProblem({ ...codingProblem, description: e.target.value })} className="bg-neutral-900 border-neutral-700 h-32" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Allowed Languages</Label>
                                    <div className="flex gap-2 flex-wrap">
                                        {["javascript", "python", "java", "cpp"].map(lang => (
                                            <div key={lang} className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                                                <Checkbox
                                                    checked={codingProblem.allowed_languages.includes(lang)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setCodingProblem({ ...codingProblem, allowed_languages: [...codingProblem.allowed_languages, lang] });
                                                        else setCodingProblem({ ...codingProblem, allowed_languages: codingProblem.allowed_languages.filter(l => l !== lang) });
                                                    }}
                                                />
                                                <span className="text-sm capitalize">{lang}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Evaluation Mode</Label>
                                    <Select value={codingProblem.evaluation_mode} onValueChange={(v: any) => setCodingProblem({ ...codingProblem, evaluation_mode: v })}>
                                        <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto-Evaluation (Test Cases)</SelectItem>
                                            <SelectItem value="manual">Manual Grading</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Starter Code</Label>
                                <Textarea value={codingProblem.starter_code} onChange={e => setCodingProblem({ ...codingProblem, starter_code: e.target.value })} className="bg-neutral-900 border-neutral-700 font-mono text-sm h-32" />
                            </div>

                            {/* Test Cases */}
                            <div className="space-y-4 border rounded-lg p-4 border-neutral-800 bg-neutral-900/20">
                                <Label>Test Cases</Label>
                                {codingProblem.test_cases.map((tc, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-neutral-950/50 rounded-lg border border-neutral-800">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-neutral-500">Input</Label>
                                            <Textarea value={tc.input} onChange={e => {
                                                const newCases = [...codingProblem.test_cases];
                                                newCases[idx].input = e.target.value;
                                                setCodingProblem({ ...codingProblem, test_cases: newCases });
                                            }} className="bg-neutral-900 border-neutral-700 font-mono text-xs" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-neutral-500">Expected Output</Label>
                                            <Textarea value={tc.expected_output} onChange={e => {
                                                const newCases = [...codingProblem.test_cases];
                                                newCases[idx].expected_output = e.target.value;
                                                setCodingProblem({ ...codingProblem, test_cases: newCases });
                                            }} className="bg-neutral-900 border-neutral-700 font-mono text-xs" />
                                        </div>
                                        {/* TODO: Add Hidden/Remove buttons */}
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => setCodingProblem({ ...codingProblem, test_cases: [...codingProblem.test_cases, { input: "", expected_output: "", is_hidden: false }] })}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Test Case
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Question Builder for MCQ/Subject */}
                            {questions.map((q, idx) => (
                                <div key={q.id} className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800 relative">
                                    <div className="absolute top-4 right-4 text-xs text-neutral-500">Q{idx + 1}</div>
                                    <div className="grid gap-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label>Question Text</Label>
                                                <Input value={q.question_text} onChange={e => updateQuestion(q.id, 'question_text', e.target.value)} className="bg-neutral-950 border-neutral-700" />
                                            </div>
                                            <div className="w-32 space-y-2">
                                                <Label>Type</Label>
                                                <Select value={q.type} onValueChange={v => updateQuestion(q.id, 'type', v)}>
                                                    <SelectTrigger className="bg-neutral-950 border-neutral-700"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="MCQ">MCQ</SelectItem>
                                                        <SelectItem value="TrueFalse">True/False</SelectItem>
                                                        <SelectItem value="ShortAnswer">Short Answer</SelectItem>
                                                        {basicInfo.type === 'Subject' && <SelectItem value="Descriptive">Descriptive</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Options for MCQ */}
                                        {q.type === 'MCQ' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                {q.options.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex gap-2 items-center">
                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer ${q.correct_answer === opt && opt !== "" ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-neutral-600'}`}
                                                            onClick={() => updateQuestion(q.id, 'correct_answer', opt)}
                                                        >
                                                            {String.fromCharCode(65 + optIdx)}
                                                        </div>
                                                        <Input
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOpts = [...q.options];
                                                                newOpts[optIdx] = e.target.value;
                                                                updateQuestion(q.id, 'options', newOpts);
                                                            }}
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            className="bg-neutral-950 border-neutral-700"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-4 items-center mt-2">
                                            <div className="flex items-center gap-2">
                                                <Label className="whitespace-nowrap">Marks:</Label>
                                                <Input type="number" value={q.marks} onChange={e => updateQuestion(q.id, 'marks', parseFloat(e.target.value))} className="w-20 bg-neutral-950 border-neutral-700 h-8" />
                                            </div>
                                            {q.type !== 'Descriptive' && (
                                                <div className="flex items-center gap-2">
                                                    <Label className="whitespace-nowrap text-red-400">Neg. Marks:</Label>
                                                    <Input type="number" value={q.negative_marks} onChange={e => updateQuestion(q.id, 'negative_marks', parseFloat(e.target.value))} className="w-20 bg-neutral-950 border-neutral-700 h-8" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={() => setQuestions([...questions, { id: Date.now(), question_text: "", type: "MCQ", options: ["", "", "", ""], correct_answer: "", marks: 5, negative_marks: 0 }])} variant="outline" className="w-full border-dashed border-neutral-700 hover:bg-neutral-900">
                                <Plus className="w-4 h-4 mr-2" /> Add Question
                            </Button>
                        </div>
                    )}

                    <div className="pt-6 mt-auto flex justify-between border-t border-neutral-800">
                        <Button variant="ghost" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={nextStep} className="bg-white text-black hover:bg-neutral-200">
                            Next: Settings <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
                <div className="space-y-6 max-w-2xl mx-auto w-full">
                    <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 space-y-6">
                        <h3 className="text-lg font-medium text-white">Configuration</h3>

                        <div className="space-y-2">
                            <Label>Timer (Minutes)</Label>
                            <Input type="number" value={settings.timer_minutes} onChange={e => setSettings({ ...settings, timer_minutes: e.target.value })} className="bg-neutral-950 border-neutral-700" />
                            <p className="text-xs text-neutral-500">Set to 0 for no time limit.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Attempts Allowed</Label>
                            <Input type="number" value={settings.attempts_allowed} onChange={e => setSettings({ ...settings, attempts_allowed: e.target.value })} className="bg-neutral-900 border-neutral-700" />
                        </div>

                        {/* Summary Display */}
                        <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-lg">
                            <h4 className="text-emerald-400 font-medium mb-2">Assessment Summary</h4>
                            <ul className="text-sm text-neutral-400 space-y-1">
                                <li>Type: <span className="text-white">{basicInfo.type}</span></li>
                                <li>Assignment: <span className="text-white">{assignments.find((a: any) => String(a.id) === basicInfo.assignment_id)?.title || 'Unknown'}</span></li>
                                {basicInfo.type === 'Coding' ? (
                                    <li>Problem: <span className="text-white">{codingProblem.title} ({codingProblem.marks} Marks)</span></li>
                                ) : (
                                    <li>Total Questions: <span className="text-white">{questions.length}</span> (Calc. Total: {questions.reduce((acc, q) => acc + parseFloat(String(q.marks || 0)), 0)})</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-between">
                        <Button variant="ghost" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        {/* Final Save handled in header, but can add here too */}
                    </div>
                </div>
            )}
        </div>
    );
}
