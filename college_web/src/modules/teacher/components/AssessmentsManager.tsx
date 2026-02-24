import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Calendar, Clock, BookOpen, Code, FileText, MoreVertical, CheckCircle, PlayCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";
import AssessmentBuilder from "./AssessmentBuilder";

// Helper
const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function AssessmentsManager() {
    const [assessments, setAssessments] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [filterAssignment, setFilterAssignment] = useState("All");

    useEffect(() => {
        fetchAssessments();
        fetchAssignments();
    }, [filterStatus, filterType, filterAssignment]);

    const fetchAssessments = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/assessments?`;
            if (filterStatus !== "All") url += `status=${filterStatus}&`;
            if (filterType !== "All") url += `type=${filterType}&`;
            if (filterAssignment !== "All") url += `assignment_id=${filterAssignment}&`;

            const res = await fetch(url, { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) setAssessments(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load assessments");
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async () => {
        try {
            const res = await fetch(`${API_URL}/assignments`, { headers: getAuthHeaders() });
            const data = await res.json();
            if (Array.isArray(data)) setAssignments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`${API_URL}/assessments/${id}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success(`Assessment ${newStatus}`);
                fetchAssessments();
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-neutral-800 text-neutral-400';
            case 'Scheduled': return 'bg-blue-900/50 text-blue-400 border-blue-800';
            case 'Active': return 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
            case 'Completed': return 'bg-purple-900/50 text-purple-400 border-purple-800';
            default: return 'bg-neutral-800 text-neutral-400';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Coding': return <Code className="h-4 w-4" />;
            case 'MCQ': return <CheckCircle className="h-4 w-4" />;
            case 'Subject': return <FileText className="h-4 w-4" />;
            default: return <BookOpen className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Assessments</h2>
                    <p className="text-neutral-400">Manage and schedule your assessments</p>
                </div>
                <Dialog open={isBuilderOpen} onOpenChange={(open) => {
                    setIsBuilderOpen(open);
                    if (!open) fetchAssessments(); // Refresh on close
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" /> Create Assessment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-950 border-neutral-800 max-w-4xl h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="sr-only">Create New Assessment</DialogTitle>
                            <DialogDescription className="sr-only">
                                Interface to create and configure a new assessment including questions and settings.
                            </DialogDescription>
                        </DialogHeader>
                        <AssessmentBuilder onSuccess={() => {
                            setIsBuilderOpen(false);
                            fetchAssessments();
                        }} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card className="bg-neutral-900/40 border-neutral-800 p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <Filter className="h-4 w-4 text-neutral-500" />

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Status</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[150px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Types</SelectItem>
                            <SelectItem value="Coding">Coding</SelectItem>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            <SelectItem value="Subject">Subject</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterAssignment} onValueChange={setFilterAssignment}>
                        <SelectTrigger className="w-[200px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Assignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Assignments</SelectItem>
                            {assignments.map((a: any) => (
                                <SelectItem key={a.id} value={String(a.id)}>{a.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" onClick={() => {
                        setFilterStatus("All");
                        setFilterType("All");
                        setFilterAssignment("All");
                    }} className="ml-auto text-neutral-400 hover:text-white">
                        Reset
                    </Button>
                </div>
            </Card>

            {/* Assessment List */}
            {loading ? (
                <div className="text-center py-12 text-neutral-500">Loading assessments...</div>
            ) : assessments.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-xl">
                    <BookOpen className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-300">No assessments found</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mt-2">
                        Create a new assessment to verify student understanding.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assessments.map((assess: any) => (
                        <Card key={assess.id} className="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`${getStatusColor(assess.status)} border`}>
                                                {assess.status}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                                {getTypeIcon(assess.type)} {assess.type}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">{assess.title}</h3>
                                        </div>
                                        <p className="text-sm text-neutral-400">
                                            Linked to: <span className="text-emerald-400">{assess.assignment_title}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs text-neutral-500 pt-2">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(assess.start_date).toLocaleDateString()} - {new Date(assess.end_date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {assess.timer_minutes} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MoreVertical className="h-3 w-3" />
                                                {assess.attempts_allowed} Attempt(s)
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-emerald-500/80">
                                                {assess.total_marks} Marks
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        {assess.status === 'Draft' && (
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/50"
                                                onClick={() => updateStatus(assess.id, 'Active')}
                                            >
                                                <PlayCircle className="mr-2 h-4 w-4" /> Publish
                                            </Button>
                                        )}
                                        {assess.status === 'Active' && (
                                            <Button
                                                size="sm"
                                                className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50"
                                                onClick={() => updateStatus(assess.id, 'Completed')}
                                            >
                                                <StopCircle className="mr-2 h-4 w-4" /> End
                                            </Button>
                                        )}
                                        {/* Future: Add 'Edit' button for Drafts */}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
