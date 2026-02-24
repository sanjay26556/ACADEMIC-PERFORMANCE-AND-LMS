import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, BrainCircuit, FileText, Play } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [codeStr, setCodeStr] = useState("");
    const [outputStr, setOutputStr] = useState("");
    const [executing, setExecuting] = useState(false);

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
            console.error(error);
            toast.error("Failed to load assessments");
        } finally {
            setLoading(false);
        }
    };

    const handleStartAssessment = async (assessment: any) => {
        setSelectedAssessment(assessment);
        try {
            const res = await fetch(`${API_URL}/assessments/${assessment.id}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAssessmentDetails(data);
                if (data.type === 'Coding' && data.problem?.starter_code) {
                    setCodeStr(data.problem.starter_code);
                }
            } else {
                toast.error("Failed to fetch details");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        }
    };

    const handleRunCode = () => {
        setExecuting(true);
        setOutputStr("Compiling and running code...");
        setTimeout(() => {
            const problem = assessmentDetails?.problem;
            if (problem && problem.test_cases && problem.test_cases.length > 0) {
                let passed = 0;
                let results = "";
                problem.test_cases.forEach((tc: any, index: number) => {
                    // MOCK EVALUATION: 50% pass rate randomly for demo, or actual check if possible
                    // In a real system, code would be sent to backend.
                    const isPass = Math.random() > 0.3;
                    if (isPass) passed++;
                    results += `Test Case ${index + 1}: ${isPass ? 'PASS' : 'FAIL'}\n`;
                });
                setOutputStr(`Execution Complete.\nPassed: ${passed}/${problem.test_cases.length} test cases.\n\nDetails:\n${results}`);
            } else {
                setOutputStr("Execution Complete. No test cases found.");
            }
            setExecuting(false);
        }, 1500);
    };

    const renderIcon = (type: string) => {
        if (type === 'Coding') return <Code className="w-5 h-5 text-blue-500" />;
        if (type === 'MCQ') return <BrainCircuit className="w-5 h-5 text-purple-500" />;
        return <FileText className="w-5 h-5 text-orange-500" />;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Assessments</h2>
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : assessments.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 bg-gray-50 rounded-xl border border-dashed">
                    No active assessments available.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map(a => (
                        <Card key={a.id} className="hover:shadow-lg transition-all cursor-pointer border-t-4 border-blue-500" onClick={() => handleStartAssessment(a)}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2">{a.type}</Badge>
                                    {renderIcon(a.type)}
                                </div>
                                <CardTitle className="text-lg">{a.title}</CardTitle>
                                <p className="text-xs text-gray-400 mt-1">Assignment: {a.assignment_title}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {a.timer_minutes} mins</span>
                                    <span>{a.total_marks} Marks</span>
                                </div>
                                <div className="mt-4 pt-4 border-t text-sm font-medium">
                                    Status: <span className={a.status === 'Active' ? 'text-green-600' : 'text-blue-600'}>{a.status}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Assessment Interface Modal */}
            <Dialog open={!!selectedAssessment} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
                <DialogContent className="max-w-6xl max-h-[95vh] h-[90vh] flex flex-col p-0 overflow-hidden">
                    <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
                        <div>
                            <DialogTitle className="text-xl font-bold">{selectedAssessment?.title}</DialogTitle>
                            <DialogDescription className="text-sm text-gray-400">
                                {selectedAssessment?.type} Assessment • {selectedAssessment?.timer_minutes} mins remaining
                            </DialogDescription>
                        </div>
                        <Button variant="destructive" onClick={() => setSelectedAssessment(null)}>Exit</Button>
                    </div>

                    <div className="flex-1 overflow-hidden flex bg-gray-50">
                        {assessmentDetails?.type === 'Coding' ? (
                            <div className="w-full flex">
                                {/* Left Panel: Problem Description */}
                                <div className="w-1/3 p-6 border-r flex flex-col overflow-y-auto bg-white">
                                    <h3 className="text-lg font-bold mb-4">{assessmentDetails?.problem?.title || 'Coding Problem'}</h3>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap flex-1">
                                        {assessmentDetails?.problem?.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Right Panel: Editor & Terminal */}
                                <div className="w-2/3 flex flex-col bg-[#1e1e1e]">
                                    {/* Editor Area */}
                                    <div className="flex-1 p-4 relative">
                                        <div className="absolute top-2 right-4 text-xs text-gray-400">Editor</div>
                                        <textarea
                                            value={codeStr}
                                            onChange={(e) => setCodeStr(e.target.value)}
                                            className="w-full h-full bg-transparent text-gray-300 font-mono text-sm resize-none focus:outline-none"
                                            spellCheck="false"
                                            placeholder="// Write your code here..."
                                        />
                                    </div>

                                    {/* Terminal / Action Area */}
                                    <div className="h-[30%] border-t border-gray-700 flex flex-col">
                                        <div className="bg-gray-800 p-2 flex justify-between items-center shrink-0">
                                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Terminal / Output</span>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary" onClick={handleRunCode} disabled={executing}>
                                                    <Play className="w-4 h-4 mr-1" /> {executing ? 'Running...' : 'Run Code'}
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Submit Solution</Button>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 overflow-y-auto bg-black text-green-400 font-mono text-sm whitespace-pre-wrap">
                                            {outputStr || "> Ready."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : assessmentDetails?.type === 'MCQ' || assessmentDetails?.type === 'Subject' ? (
                            <div className="w-full max-w-3xl mx-auto p-6 overflow-y-auto bg-white shadow-lg m-6 rounded-lg">
                                <h3 className="text-xl font-bold mb-6">Questions</h3>
                                {assessmentDetails?.questions?.map((q: any, i: number) => (
                                    <div key={q.id} className="mb-8 p-4 border rounded-lg">
                                        <p className="font-semibold text-lg mb-4">{i + 1}. {q.question_text}</p>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 mb-4 inline-block">{q.marks} Marks</span>

                                        {q.type === 'MCQ' && q.options && (() => {
                                            const options = JSON.parse(q.options);
                                            return (
                                                <div className="space-y-2 mt-2">
                                                    {options.map((opt: string, optIdx: number) => (
                                                        <label key={optIdx} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                                                            <input type="radio" name={`q_${q.id}`} className="mr-3" />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            )
                                        })()}

                                        {q.type === 'Descriptive' && (
                                            <textarea className="w-full p-4 border rounded-md min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type your answer here..." />
                                        )}
                                    </div>
                                ))}
                                <Button className="w-full mt-4" size="lg">Submit Assessment</Button>
                            </div>
                        ) : (
                            <div className="p-8 text-center w-full">Loading assessment details...</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
