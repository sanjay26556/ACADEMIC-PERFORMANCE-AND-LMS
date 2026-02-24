
import { useState, useMemo } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen, Search, Filter, MoreVertical, Plus,
    Users, Clock, Star, Edit, Trash2, Code, Laptop,
    GraduationCap, Target, Sparkles, Trophy, Video,
    FileText, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLMS } from "@/context/LMSContext";

// --- VALIDATION SCHEMA ---
const courseSchema = z.object({
    name: z.string().min(2, "Course name is required"),
    code: z.string().min(2, "Course code is required"),
    subject: z.string().min(2, "Subject is required"),
    description: z.string().max(300, "Description max 300 chars"),
    credits: z.coerce.number().min(1, "At least 1 credit required").max(10, "Max 10 credits"),
});

// --- MOCK DATA ---
const MOCK_COURSES = [
    {
        id: "c1",
        name: "Advanced React Patterns",
        code: "CS401",
        subject: "Web Development",
        description: "Deep dive into HOCs, Render Props, and Custom Hooks.",
        credits: 4,
        instructor: "Dr. Sarah Smith",
        enrolled: 124,
        maxStudents: 150,
        status: "Active",
        rating: 4.8,
        level: "Advanced",
        xp: 1200,
        progress: 65 // Average class progress
    },
    {
        id: "c2",
        name: "Data Structures & A.I.",
        code: "CS402",
        subject: "Computer Science",
        description: "Core algorithms and their implementation in Python.",
        credits: 4,
        instructor: "Prof. Alan Turing",
        enrolled: 89,
        maxStudents: 100,
        status: "Active",
        rating: 4.5,
        level: "Intermediate",
        xp: 1500,
        progress: 42
    },
    {
        id: "c3",
        name: "UI/UX Design Fundamentals",
        code: "DS101",
        subject: "Design",
        description: "Principles of user-centered design and prototyping.",
        credits: 3,
        instructor: "Jane Doe",
        enrolled: 56,
        maxStudents: 60,
        status: "Active",
        rating: 4.9,
        level: "Beginner",
        xp: 800,
        progress: 88
    },
    {
        id: "c4",
        name: "Cloud Computing w/ AWS",
        code: "IT305",
        subject: "Details",
        description: "Deploying scalable applications on the cloud.",
        credits: 5,
        instructor: "Mike Johnson",
        enrolled: 110,
        maxStudents: 120,
        status: "Active",
        rating: 4.7,
        level: "Advanced",
        xp: 2000,
        progress: 30
    },
    {
        id: "c5",
        name: "Introduction to DevOps",
        code: "IT306",
        subject: "Operations",
        description: "CI/CD pipelines, Docker, and Kubernetes basics.",
        credits: 4,
        instructor: "Emily White",
        enrolled: 45,
        maxStudents: 50,
        status: "Upcoming",
        rating: 0,
        level: "Intermediate",
        xp: 1200,
        progress: 0
    }
];

export function CourseDirectory() {
    const { addCourse, deleteCourse, courses: contextCourses } = useLMS();
    // Combine context courses with mock courses for display if context is empty/limited
    // For now, we'll primarily use the mock data to ensure "hard coded datas" request is met, 
    // but mixing in real logic is good practice.

    // In a real app, you'd merge or prefer the context data. 
    // Here we'll just display the MOCK_COURSES to guarantee the requested look and mock data.
    const [courses, setCourses] = useState(MOCK_COURSES);
    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            name: "",
            code: "",
            subject: "",
            description: "",
            credits: 3
        },
    });

    const onSubmit = (data: z.infer<typeof courseSchema>) => {
        // Mock addition
        const newCourse = {
            id: `new-${Date.now()}`,
            name: data.name,
            code: data.code,
            subject: data.subject,
            description: data.description,
            credits: data.credits,
            instructor: "Assigned Instructor",
            enrolled: 0,
            maxStudents: 60,
            status: "Upcoming",
            rating: 0,
            level: "Beginner",
            xp: 1000,
            progress: 0
        };

        setCourses([...courses, newCourse]);

        // Also call the context function to keep real state potentially in sync
        addCourse({
            id: newCourse.id,
            name: newCourse.name,
            code: newCourse.code,
            subject: newCourse.subject,
            description: newCourse.description
        });

        toast.success("Course created successfully!");
        setIsAddModalOpen(false);
        form.reset();
    };

    const handleDelete = (id: string) => {
        setCourses(courses.filter(c => c.id !== id));
        deleteCourse(id); // Call context
        toast.success("Course deleted successfully");
    };

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSubject = subjectFilter === "all" || course.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        });
    }, [courses, searchQuery, subjectFilter]);

    const uniqueSubjects = Array.from(new Set(courses.map(c => c.subject)));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats - Gamified */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-600/10 to-blue-900/5 border border-blue-500/20 shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BookOpen className="w-24 h-24 text-blue-500 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-200/60 font-medium tracking-wide uppercase text-xs">Total Catalog</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-100">{courses.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                            <Code className="w-3 h-3" />
                            <span>Active Courses</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Total Students</CardDescription>
                        <CardTitle className="text-4xl font-black text-purple-100 group-hover:text-purple-400 transition-colors">
                            {courses.reduce((acc, curr) => acc + curr.enrolled, 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <span>Across all subjects</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-orange-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Avg. Rating</CardDescription>
                        <CardTitle className="text-4xl font-black text-orange-100 group-hover:text-orange-400 transition-colors">4.7</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                            <span>Highly Rated</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 bg-gradient-to-br from-green-900/10 to-black border border-green-500/20 flex flex-col justify-center items-center text-center p-6 relative overflow-hidden group cursor-pointer hover:bg-green-900/20 transition-all" onClick={() => setIsAddModalOpen(true)}>
                    <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors" />
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-green-100">Create Course</h3>
                    <p className="text-xs text-green-400/60 mt-1">Add new curriculum</p>
                </Card>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-neutral-900/40 p-4 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-neutral-950/50 border-white/10 text-white placeholder:text-neutral-600 focus:ring-blue-500/50"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-neutral-500" />
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                        <SelectTrigger className="w-[180px] bg-neutral-950/50 border-white/10 text-neutral-300">
                            <SelectValue placeholder="Subject" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                            <SelectItem value="all">All Subjects</SelectItem>
                            {uniqueSubjects.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* COURSE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                        {/* Card Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <CardHeader className="relative z-10 pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] px-2 py-0.5 uppercase tracking-wider">
                                    {course.subject}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800">
                                        <DropdownMenuItem className="text-neutral-300 focus:bg-neutral-800 focus:text-white">
                                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400 focus:bg-red-950/30 focus:text-red-300" onClick={() => handleDelete(course.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">{course.name}</CardTitle>
                            <CardDescription className="text-neutral-500 font-mono text-xs">{course.code}</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            <p className="text-sm text-neutral-400 line-clamp-2 h-10">{course.description}</p>

                            <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
                                    <GraduationCap className="w-4 h-4 text-neutral-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-neutral-300">{course.instructor}</div>
                                    <div className="text-[10px] text-neutral-500">Lead Instructor</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-neutral-500">
                                    <span>Enrollment ({course.enrolled}/{course.maxStudents})</span>
                                    <span className="text-blue-400">{Math.round((course.enrolled / course.maxStudents) * 100)}% Full</span>
                                </div>
                                <Progress value={(course.enrolled / course.maxStudents) * 100} className="h-1.5 bg-neutral-800" indicatorClassName={cn(
                                    (course.enrolled / course.maxStudents) > 0.9 ? "bg-red-500" : "bg-blue-500"
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-950/50 p-1.5 rounded border border-white/5">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    <span>{course.xp} XP</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-950/50 p-1.5 rounded border border-white/5">
                                    <Clock className="w-3 h-3 text-cyan-500" />
                                    <span>{course.credits} Credits</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Course Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-green-400" />
                            Create New Course
                        </DialogTitle>
                        <DialogDescription className="text-neutral-400">Add a new academic course to the catalog.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-neutral-400">Course Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Advanced AI" {...field} className="bg-neutral-950 border-neutral-800 focus:ring-green-500/50 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-neutral-400">Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="CS-101" {...field} className="bg-neutral-950 border-neutral-800 focus:ring-green-500/50 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="credits"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-neutral-400">Credits</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-neutral-950 border-neutral-800 focus:ring-green-500/50 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-neutral-400">Subject/Dept</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Computer Science" {...field} className="bg-neutral-950 border-neutral-800 focus:ring-green-500/50 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-neutral-400">Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Brief overview..." {...field} className="bg-neutral-950 border-neutral-800 focus:ring-green-500/50 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6">
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                                    Launch Course
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
