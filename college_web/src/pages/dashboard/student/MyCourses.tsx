import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, PlayCircle, Layers } from "lucide-react";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function MyCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${API_URL}/student/courses`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setCourses(Array.isArray(data) ? data : []);
                } else {
                    toast.error("Failed to load courses");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error connecting to server");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const gradients = [
        "bg-gradient-to-r from-purple-500 to-indigo-600",
        "bg-gradient-to-br from-pink-500 to-rose-500",
        "bg-gradient-to-br from-blue-500 to-cyan-500",
        "bg-gradient-to-br from-emerald-500 to-green-600",
        "bg-gradient-to-br from-red-500 to-orange-600"
    ];

    if (loading) {
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
                        <p className="text-muted-foreground mt-1">Manage your enrolled courses from your teachers.</p>
                    </div>
                </div>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" /> Enrolled Courses
                    </h2>

                    {courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-border mt-8 gap-4 text-center">
                            <Layers className="w-12 h-12 text-muted-foreground" />
                            <h3 className="text-xl font-medium">No courses found</h3>
                            <p className="text-muted-foreground">You haven't been enrolled in any courses by your teacher yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course, i) => (
                                <Card key={course.id} className="group hover:ring-2 hover:ring-primary/50 transition-all duration-300 overflow-hidden">
                                    <div className={`h-32 w-full ${gradients[i % gradients.length]} relative overflow-hidden flex items-center justify-center`}>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                        <PlayCircle className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform relative z-10" />
                                        <div className="absolute top-3 right-3 text-white">
                                            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium shadow-sm">
                                                {course.code}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="p-5 pb-0">
                                        <h3 className="font-display font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors" title={course.name}>
                                            {course.name}
                                        </h3>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="w-4 h-4" />
                                            <span className="truncate">{course.teacher_name || "Unassigned"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded-md justify-between">
                                            <span>Year: {course.year}</span>
                                            <span>Sem: {course.semester}</span>
                                            <span>Sec: {course.section}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-5 pt-0">
                                        <Button className="w-full shadow-md" size="sm">Enter Course</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
