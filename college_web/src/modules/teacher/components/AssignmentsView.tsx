import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Code, BookOpen, BrainCircuit, Calendar, Video, FileText, Plus, Trash2, Bot, Sparkles } from "lucide-react";

export const fetchWithAuth = async (url: string, options: any = {}) => {
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/lms/teacher/login';
        throw new Error('Unauthorized');
    }
    return res;
};




const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function AssignmentsView() {
    const [assignments, setAssignments] = useState([]);
    const [activeCategory, setActiveCategory] = useState<"Coding" | "Aptitude" | "Subject" | null>(null);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: "", description: "", difficulty_level: "Medium",
        course_id: "", due_date: "", marks: "",
        video_url: "", material_url: "",
        problem_statement: "", // For Coding description? Or separate field? Using description for now.
        input_method: "Code Editor" // Coding specific
    });

    // AI Generation State
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState<any>(null);
    const [showAI, setShowAI] = useState(false);

    useEffect(() => {
        fetchAssignments();
        fetchCourses();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/assignments`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (res.ok) setAssignments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (res.ok) setCourses(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCategory) return;
        setLoading(true);

        const payload = {
            ...formData,
            category: activeCategory,
            total_marks: 0
        };

        try {
            const res = await fetchWithAuth(`${API_URL}/assignments`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Assignment created successfully");
                setFormData({
                    title: "", description: "", difficulty_level: "Medium",
                    course_id: "", due_date: "", marks: "",
                    video_url: "", material_url: "",
                    problem_statement: "", input_method: "Code Editor"
                });
                setActiveCategory(null);
                fetchAssignments();
            } else {
                toast.error("Failed to create assignment");
            }
        } catch (err) {
            toast.error("Error creating assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleAIGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiGenerating(true);
        setAiResponse(null);
        try {
            const res = await fetchWithAuth(`${API_URL}/assignments/generate-ai`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ prompt: aiPrompt, category: activeCategory })
            });
            const data = await res.json();
            if (data.error) {
                toast.error(data.error);
                setAiResponse({ error: data.error });
            } else {
                setAiResponse(data);
                toast.success("Assignment drafted!");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to generate AI assignment");
            setAiResponse({ error: "Failed to generate AI assignment" });
        } finally {
            setAiGenerating(false);
        }
    };

    const applyAIAssignment = () => {
        if (!aiResponse || aiResponse.error) return;
        setFormData(prev => ({
            ...prev,
            title: aiResponse.title || prev.title,
            description: aiResponse.description || prev.description
        }));
        setShowAI(false);
        toast.success("Assignment content applied to form!");
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/assignments/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                toast.success("Assignment deleted");
                fetchAssignments();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">Assignments</h2>

            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { id: "Coding", icon: Code, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/50" },
                    { id: "Aptitude", icon: BrainCircuit, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/50" },
                    { id: "Subject", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/50" }
                ].map((cat: any) => (
                    <div
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`cursor-pointer p-6 rounded-xl border transition-all hover:scale-105 ${activeCategory === cat.id ? `${cat.bg} ${cat.border} ring-2 ring-offset-2 ring-offset-neutral-950 ring-${cat.color.split('-')[1]}-500` : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-neutral-900 ${cat.color}`}>
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{cat.id} Assignment</h3>
                                <p className="text-sm text-neutral-400">Create new {cat.id.toLowerCase()} task</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Form */}
            {activeCategory && (
                <div className="space-y-6">
                    {/* AI Generator Panel */}
                    <Card className="bg-neutral-900/50 border-emerald-500/30 overflow-hidden">
                        <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-emerald-400 flex items-center gap-2">
                                            AI Academic Assistant <Sparkles className="w-4 h-4" />
                                        </CardTitle>
                                        <CardDescription className="text-emerald-400/70">
                                            Describe your academic requirement and I'll generate it instantly.
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                    onClick={() => setShowAI(!showAI)}
                                    type="button"
                                >
                                    {showAI ? "Hide Assistant" : "Open Assistant"}
                                </Button>
                            </div>
                        </CardHeader>
                        
                        {showAI && (
                            <CardContent className="p-6 space-y-4 bg-neutral-950/30">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder={`e.g., Generate a hard ${activeCategory} assignment about Data Structures...`}
                                        className="bg-neutral-900 border-emerald-500/30 focus-visible:ring-emerald-500"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
                                    />
                                    <Button 
                                        type="button"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                                        onClick={handleAIGenerate}
                                        disabled={aiGenerating || !aiPrompt.trim()}
                                    >
                                        {aiGenerating ? "Thinking..." : "Generate AI"}
                                    </Button>
                                </div>
                                
                                {aiResponse && (
                                    <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-4 animate-in fade-in">
                                        {aiResponse.error ? (
                                            <div className="text-red-400 flex items-start gap-2">
                                                <Bot className="w-5 h-5 mt-0.5" />
                                                <p>{aiResponse.error}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div>
                                                    <h4 className="text-lg font-bold text-white mb-2">{aiResponse.title}</h4>
                                                    <div className="text-sm text-neutral-300 whitespace-pre-wrap font-mono bg-neutral-950 p-4 rounded-lg border border-neutral-800 max-h-64 overflow-y-auto">
                                                        {aiResponse.description}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end pt-2">
                                                    <Button type="button" onClick={applyAIAssignment} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
                                                        <Plus className="w-4 h-4" /> Use this Assignment
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    <Card className="bg-neutral-900/50 border-neutral-800 animate-in fade-in slide-in-from-top-4">
                        <CardHeader>
                            <CardTitle>Create {activeCategory} Assignment</CardTitle>
                        </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-neutral-950 border-neutral-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Course (Optional)</Label>
                                    <Select value={formData.course_id} onValueChange={v => setFormData({ ...formData, course_id: v })}>
                                        <SelectTrigger className="bg-neutral-950 border-neutral-700"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-neutral-950 border-neutral-700" />
                            </div>

                            {activeCategory === "Coding" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <Select value={formData.difficulty_level} onValueChange={v => setFormData({ ...formData, difficulty_level: v })}>
                                            <SelectTrigger className="bg-neutral-950 border-neutral-700"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Easy">Easy</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="Hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Input Method</Label>
                                        <Select value={formData.input_method} onValueChange={v => setFormData({ ...formData, input_method: v })}>
                                            <SelectTrigger className="bg-neutral-950 border-neutral-700"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Code Editor">Code Editor</SelectItem>
                                                <SelectItem value="File Upload">File Upload</SelectItem>
                                                <SelectItem value="Text Answer">Text Answer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>YouTube Video Link (Optional)</Label>
                                <Input value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} placeholder="https://youtube.com/..." className="bg-neutral-950 border-neutral-700" />
                            </div>

                            {activeCategory === "Subject" && (
                                <div className="space-y-2">
                                    <Label>Material URL (PDF/Notes)</Label>
                                    <Input value={formData.material_url} onChange={e => setFormData({ ...formData, material_url: e.target.value })} placeholder="https://..." className="bg-neutral-950 border-neutral-700" />
                                </div>
                            )}

                            <div className="space-y-2 mb-4">
                                <Label>Due Date</Label>
                                <Input type="datetime-local" required value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="bg-neutral-950 border-neutral-700" />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setActiveCategory(null)}>Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                    {loading ? "Saving..." : "Save Assignment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                </div>
            )}

            {/* Assignments List */}
            <div className="grid gap-4">
                <h3 className="text-xl font-bold text-white mt-8">All Assignments</h3>
                {assignments.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                        No assignments found. Select a category above to create one.
                    </div>
                ) : (
                    assignments.map((assign: any) => (
                        <Card key={assign.id} className="bg-neutral-900/50 border-neutral-800">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${assign.category === 'Coding' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                assign.category === 'Aptitude' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>{assign.category}</span>
                                            <h4 className="text-lg font-bold text-white">{assign.title}</h4>
                                        </div>
                                        <p className="text-neutral-400 text-sm line-clamp-2">{assign.description}</p>
                                        <div className="flex gap-4 text-xs text-neutral-500 mt-2">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                            {assign.video_url && <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                                            {assign.material_url && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Material</span>}
                                            {assign.course_code && <span>{assign.course_code}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(assign.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
