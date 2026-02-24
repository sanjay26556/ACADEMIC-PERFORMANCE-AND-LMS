import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, FileText, Code, BrainCircuit, BookOpen, Clock, PlayCircle, Play } from "lucide-react";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentAssignmentsView() {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [codeStr, setCodeStr] = useState("");
    const [outputStr, setOutputStr] = useState("");
    const [executing, setExecuting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<any>({}); // Store assignment statuses

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${API_URL}/assignments`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAssignments(data);
                const realStatus: any = {};
                for (let a of (Array.isArray(data) ? data : [])) {
                    realStatus[a.id] = a.status || 'Pending';
                }
                setStatus(realStatus);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            toast.error("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAssignment = async () => {
        if (!selectedAssignment) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/assignments/${selectedAssignment.id}/submit`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Assignment submitted successfully!");
                setSelectedAssignment(null);
                fetchAssignments(); // Refresh status
            } else {
                toast.error(data.message || "Failed to submit assignment");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Submitted':
                return 'default';
            case 'Overdue':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getYoutubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleRunCode = () => {
        setExecuting(true);
        setOutputStr("Compiling and executing...");
        setTimeout(() => {
            if (codeStr.includes('error')) {
                setOutputStr("SyntaxError: Unexpected identifier at line 1");
            } else {
                setOutputStr("Execution successful.\nOutput: Hello, World!");
            }
            setExecuting(false);
        }, 1200);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800">My Assignments</h2>

            {loading ? (
                <div className="text-center py-12 text-neutral-500">Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 bg-gray-50 rounded-xl border border-dashed">
                    No assignments assigned to you yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assign: any) => (
                        <Card key={assign.id} className="cursor-pointer hover:shadow-lg transition-all group" onClick={() => setSelectedAssignment(assign)}>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                    <Badge variant={
                                        assign.category === 'Coding' ? 'default' :
                                            assign.category === 'Aptitude' ? 'secondary' : 'outline'
                                    } className="mb-2">
                                        {assign.category}
                                    </Badge>
                                    <Badge variant={getStatusVariant(status[assign.id])}>
                                        {status[assign.id]}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg mb-2">{assign.title}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{assign.description}</p>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(assign.due_date).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedAssignment} onOpenChange={(open) => {
                if (!open) { setSelectedAssignment(null); setCodeStr(""); setOutputStr(""); }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            {selectedAssignment?.title}
                            <Badge variant="outline">{selectedAssignment?.category}</Badge>
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            {selectedAssignment?.description}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Video Player */}
                        {selectedAssignment?.video_url && getYoutubeId(selectedAssignment.video_url) && (
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedAssignment.video_url)}`}
                                    title="Assignment Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="border-0"
                                ></iframe>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> Due: <span className="font-semibold">{selectedAssignment && new Date(selectedAssignment.due_date).toLocaleString()}</span></div>
                            {selectedAssignment?.material_url && (
                                <a href={selectedAssignment.material_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <FileText className="w-4 h-4" /> Reference Material
                                </a>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setSelectedAssignment(null)}>Close</Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleSubmitAssignment}
                                disabled={submitting || (selectedAssignment && status[selectedAssignment.id] === 'Submitted')}
                            >
                                {submitting ? 'Submitting...' : (selectedAssignment && status[selectedAssignment.id] === 'Submitted') ? 'Already Submitted' : 'Submit Assignment'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
