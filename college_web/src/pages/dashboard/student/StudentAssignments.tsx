
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    UploadCloud,
    Search,
    Filter,
    Download,
    ChevronLeft,
    Calendar
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// --- Types ---
type AssignmentStatus = "Upcoming" | "In Progress" | "Due Soon" | "Submitted" | "Graded" | "Late" | "Missed";

interface Assignment {
    id: string;
    title: string;
    course: string;
    dueDate: string; // ISO String
    submittedDate?: string; // ISO String
    status: AssignmentStatus;
    grade?: string;
    feedback?: string;
    description: string;
    resources?: { name: string; url: string }[];
}


// --- Mock Data ---
const MOCK_ASSIGNMENTS: Assignment[] = [
    {
        id: "a1",
        title: "DSA Lab 03: Linked Lists",
        course: "Data Structures",
        dueDate: "2026-01-22T23:59:00",
        status: "In Progress",
        description: "Implement a doubly linked list with the following operations: insert, delete, and reverse.",
        resources: [{ name: "Lab Manual.pdf", url: "#" }]
    },
    {
        id: "a2",
        title: "Networking Essay: TCP vs UDP",
        course: "Computer Networks",
        dueDate: "2026-01-20T17:00:00",
        status: "Due Soon",
        description: "Write a 1500-word essay comparing TCP and UDP protocols, focusing on reliability and speed."
    },
    {
        id: "a3",
        title: "Cloud Report: AWS Services",
        course: "Cloud Computing",
        dueDate: "2026-01-14T19:30:00",
        submittedDate: "2026-01-14T18:00:00",
        status: "Submitted",
        description: "Analyze the core services provided by AWS and their use cases."
    },
    {
        id: "a4",
        title: "OS Midterm Project",
        course: "Operating Systems",
        dueDate: "2026-01-10T23:59:00",
        submittedDate: "2026-01-10T20:00:00",
        grade: "87/100",
        feedback: "Great work on the memory management module. Minor issues in process scheduling.",
        status: "Graded",
        description: "Build a simple OS scheduler simulation."
    },
    {
        id: "a5",
        title: "React Fundamentals Quiz",
        course: "Web Development",
        dueDate: "2026-01-18T12:00:00",
        status: "Late",
        description: "Complete the online quiz on React Hooks and Components."
    }
];

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: AssignmentStatus }) => {
    switch (status) {
        case "Upcoming": return <Badge variant="outline" className="border-blue-500 text-blue-500">Upcoming</Badge>;
        case "In Progress": return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">In Progress</Badge>;
        case "Due Soon": return <Badge variant="destructive" className="animate-pulse">Due Soon</Badge>;
        case "Submitted": return <Badge variant="default" className="bg-green-600">Submitted</Badge>;
        case "Graded": return <Badge variant="outline" className="border-purple-500 text-purple-400">Graded</Badge>;
        case "Late": return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500">Late</Badge>;
        case "Missed": return <Badge variant="destructive">Missed</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

const AssignmentCard = ({
    assignment,
    onClick
}: {
    assignment: Assignment;
    onClick: (a: Assignment) => void
}) => {
    // Helper to format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const isGraded = assignment.status === "Graded";

    return (
        <Card
            className="group hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5 bg-card/40 backdrop-blur-sm"
            onClick={() => onClick(assignment)}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <Badge variant="glass" className="text-xs mb-2">{assignment.course}</Badge>
                    <StatusBadge status={assignment.status} />
                </div>
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {isGraded ? (
                        <span>Submitted on {formatDate(assignment.submittedDate!)}</span>
                    ) : (
                        <span>Due {formatDate(assignment.dueDate)}</span>
                    )}
                </div>

                {isGraded && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-purple-400">Score:</span>
                        <span className="text-lg font-bold">{assignment.grade}</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                <Button variant={isGraded ? "outline" : "default"} size="sm" className="w-full">
                    {isGraded ? "View Feedback" : "View Assignment"}
                </Button>
            </CardFooter>
        </Card>
    );
};

const AssignmentDetail = ({
    assignment,
    onClose
}: {
    assignment: Assignment;
    onClose: () => void
}) => {
    const isSubmitted = ["Submitted", "Graded"].includes(assignment.status);
    const isLocked = new Date(assignment.dueDate) < new Date() && !isSubmitted;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <Button variant="ghost" onClick={onClose} className="mb-2 gap-2 pl-0 hover:pl-2 transition-all">
                <ChevronLeft className="w-4 h-4" /> Back to Assignments
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-display font-bold">{assignment.title}</h1>
                    <p className="text-muted-foreground text-lg">{assignment.course}</p>
                </div>
                <StatusBadge status={assignment.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Content & Instructions */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{assignment.description}</p>

                            {assignment.resources && (
                                <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                                    <h4 className="flex items-center gap-2 font-medium mb-3">
                                        <FileText className="w-4 h-4" /> Attached Resources
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {assignment.resources.map((res, idx) => (
                                            <Button key={idx} variant="outline" size="sm" className="gap-2">
                                                <Download className="w-3 h-3" /> {res.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {assignment.feedback && (
                                <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <h4 className="flex items-center gap-2 font-medium mb-2 text-purple-400">
                                        <CheckCircle className="w-4 h-4" /> Teacher Verification & Feedback
                                    </h4>
                                    <p className="text-sm italic text-gray-300">"{assignment.feedback}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Submission Area */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Submission</CardTitle>
                            <CardDescription>
                                {isSubmitted
                                    ? `Submitted on ${new Date(assignment.submittedDate!).toLocaleString()}`
                                    : `Due by ${new Date(assignment.dueDate).toLocaleString()}`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isSubmitted && !isLocked && (
                                <>
                                    <div className="border-2 border-dashed border-gray-700 hover:border-primary/50 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-muted/20">
                                        <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
                                        <p className="font-medium">Drag & drop files here</p>
                                        <p className="text-xs text-muted-foreground mt-1">or click to browse (Max 10MB)</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Optional Comments</Label>
                                        <Textarea placeholder="Add a note to your teacher..." className="resize-none h-20" />
                                    </div>
                                </>
                            )}

                            {isSubmitted && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">Assignment Submitted</span>
                                </div>
                            )}

                            {isLocked && !isSubmitted && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">Deadline Passed</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            {!isSubmitted && (
                                <Button className="w-full" disabled={isLocked}>
                                    {isLocked ? "Submission Closed" : "Submit Assignment"}
                                </Button>
                            )}
                            {isSubmitted && (
                                <Button variant="outline" className="w-full">
                                    View Submission Details
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-sm text-yellow-500">
                                <AlertCircle className="w-4 h-4" />
                                <span>Late submissions reduce grade by 10%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const StudentAssignments = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [filter, setFilter] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Mock API Call
        setTimeout(() => {
            setAssignments(MOCK_ASSIGNMENTS);
            setIsLoading(false);
        }, 800);
    }, []);

    // Derived Data
    const filteredAssignments = assignments.filter(a => {
        const matchesFilter = filter === "All"
            ? true
            : filter === "Submitted"
                ? ["Submitted", "Graded"].includes(a.status)
                : a.status === filter;

        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const pendingAssignments = filteredAssignments.filter(a => !["Submitted", "Graded"].includes(a.status));
    const completedAssignments = filteredAssignments.filter(a => ["Submitted", "Graded"].includes(a.status));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex">
                <Sidebar role="student" />
                <main className="ml-64 flex-1 p-8 flex items-center justify-center">
                    <div className="animate-pulse space-y-4 text-center">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
                        <p className="text-muted-foreground">Fetching assignments...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar role="student" />

            <main className="ml-64 flex-1 p-8">
                {selectedAssignment ? (
                    <AssignmentDetail
                        assignment={selectedAssignment}
                        onClose={() => setSelectedAssignment(null)}
                    />
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-display font-bold">Assignments</h1>
                                <p className="text-muted-foreground mt-1">Manage your tasks and submissions for this semester</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search assignments..."
                                        className="pl-9 w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <Tabs defaultValue="All" className="w-full" onValueChange={setFilter}>
                            <TabsList>
                                <TabsTrigger value="All">All</TabsTrigger>
                                <TabsTrigger value="In Progress">Pending</TabsTrigger>
                                <TabsTrigger value="Submitted">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Content */}
                        {filteredAssignments.length === 0 ? (
                            <div className="text-center py-16 border rounded-xl border-dashed">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">No assignments found</h3>
                                <p className="text-muted-foreground">You're all caught up! Check back later.</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Only show sections if we're in "All" view or specific view matches */}
                                {(filter === "All" || filter === "In Progress") && pendingAssignments.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-primary" /> Upcoming & Pending
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {pendingAssignments.map(assignment => (
                                                <AssignmentCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                    onClick={setSelectedAssignment}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {(filter === "All" || filter === "Submitted") && completedAssignments.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-success" /> Completed & Graded
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {completedAssignments.map(assignment => (
                                                <AssignmentCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                    onClick={setSelectedAssignment}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentAssignments;
