
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlayCircle, Clock, Award, CheckCircle, Plus, MoreVertical, BookOpen, ArrowRight } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// --- Mock Data ---
const ACTIVE_COURSE = {
    id: "c1",
    title: "Advanced React Patterns",
    instructor: "Sarah Drasner",
    progress: 65,
    nextLesson: "Compound Components & Context",
    timeLeft: "45 mins",
    totalModules: 12,
    completedModules: 7,
    thumbnail: "bg-gradient-to-r from-purple-500 to-indigo-600", // using css gradients for mock images
};

const ENROLLED_COURSES = [
    {
        id: "c2",
        title: "UI/UX Design Principles",
        instructor: "Gary Simon",
        category: "Design",
        progress: 32,
        totalLessons: 24,
        completedLessons: 8,
        thumbnail: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
        id: "c3",
        title: "Fullstack Next.js 14",
        instructor: "Sonny Sangha",
        category: "Development",
        progress: 88,
        totalLessons: 40,
        completedLessons: 35,
        thumbnail: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
        id: "c4",
        title: "Data Structures in Python",
        instructor: "Dr. Angela Yu",
        category: "Computer Science",
        progress: 12,
        totalLessons: 60,
        completedLessons: 7,
        thumbnail: "bg-gradient-to-br from-emerald-500 to-green-600",
    },
    {
        id: "c5",
        title: "Cybersecurity Basics",
        instructor: "NetworkChuck",
        category: "Security",
        progress: 45,
        totalLessons: 15,
        completedLessons: 6,
        thumbnail: "bg-gradient-to-br from-red-500 to-orange-600",
    },
];

const COMPLETED_COURSES = [
    {
        id: "c6",
        title: "Intro to Web 3.0",
        completedDate: "Jan 12, 2025",
        grade: "98%",
        thumbnail: "bg-gray-800 border border-gray-700",
    },
    {
        id: "c7",
        title: "Git & GitHub Masterclass",
        completedDate: "Dec 20, 2024",
        grade: "100%",
        thumbnail: "bg-gray-800 border border-gray-700",
    }
];

// --- Components ---

const CourseCard = ({ course }: { course: typeof ENROLLED_COURSES[0] }) => (
    <Card variant="glass" className="group hover:ring-2 hover:ring-primary/50 transition-all duration-300">
        <div className={`h-32 w-full ${course.thumbnail} relative overflow-hidden rounded-t-xl group-hover:scale-105 transition-transform duration-500`}>
            <div className="absolute top-3 right-3">
                <Badge variant="glass" className="backdrop-blur-xl bg-black/20 text-white border-none">
                    {course.category}
                </Badge>
            </div>
        </div>
        <CardContent className="p-5 space-y-4">
            <div>
                <h3 className="font-display font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                    {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{course.progress}% Complete</span>
                    <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                </div>
                <Progress value={course.progress} className="h-2" color={course.progress > 80 ? "success" : "default"} />
            </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex gap-3">
            <Button className="flex-1" size="sm">Continue</Button>
            <Button variant="outline" size="sm">Details</Button>
        </CardFooter>
    </Card>
);

const ActiveCourseBanner = ({ course }: { course: typeof ACTIVE_COURSE }) => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-1">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 bg-card/30 backdrop-blur-sm p-6 rounded-xl">
            {/* Thumbnail area with play button */}
            <div className={`w-full md:w-64 h-40 rounded-xl ${course.thumbnail} flex items-center justify-center shadow-2xl shrink-0 group cursor-pointer`}>
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-medium text-sm tracking-wider uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        In Progress
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white">{course.title}</h2>
                    <p className="text-muted-foreground">Instructor: <span className="text-gray-300">{course.instructor}</span></p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Up Next:</p>
                            <p className="font-medium text-white flex items-center gap-2">
                                <PlayCircle className="w-4 h-4 text-primary" /> {course.nextLesson}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-primary">{course.progress}%</span>
                        </div>
                    </div>
                    <Progress value={course.progress} className="h-2 bg-gray-700" />
                </div>

                <div className="flex gap-4 pt-2">
                    <Button size="lg" className="px-8 shadow-lg shadow-primary/20">Resume Learning</Button>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                        <Clock className="w-4 h-4" /> {course.timeLeft} left in module
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Page Component ---
const MyCourses = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex">
                <Sidebar role="student" />
                <main className="ml-64 flex-1 p-8 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        <p className="text-muted-foreground font-medium">Loading your learning space...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar role="student" />

            <main className="ml-64 flex-1 p-8 space-y-10">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">My Courses</h1>
                        <p className="text-muted-foreground mt-1">Manage your enrolled and in-progress courses</p>
                    </div>
                    <Button className="gap-2 shadow-lg shadow-primary/25">
                        <Plus className="w-4 h-4" /> Add New Course
                    </Button>
                </div>

                {/* Active Course */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Continue Learning
                    </h2>
                    <ActiveCourseBanner course={ACTIVE_COURSE} />
                </section>

                {/* Enrolled Courses */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" /> Enrolled Courses
                        </h2>
                        {/* Filter/Sort mock */}
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            Sort by: Recently Accessed
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {ENROLLED_COURSES.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </section>

                {/* Completed Courses */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" /> Completed
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {COMPLETED_COURSES.map(course => (
                            <div key={course.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-card/50 hover:bg-card transition-colors group">
                                <div className={`w-16 h-16 rounded-lg ${course.thumbnail} flex items-center justify-center shrink-0`}>
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground truncate">{course.title}</h4>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span>Grade: <span className="text-green-400 font-medium">{course.grade}</span></span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Finished {course.completedDate}</p>
                                </div>
                                <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    Certificate
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MyCourses;
