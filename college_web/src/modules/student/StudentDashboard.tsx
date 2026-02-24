
import { useState, useEffect } from "react";
import { useLMS, Student } from "@/context/LMSContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Book, GraduationCap, FileText, Home, CalendarCheck, TrendingUp, Trophy, Bell, Activity } from "lucide-react";
import StudentAssignmentsView from "./components/StudentAssignmentsView";
import StudentHomeView from "./components/StudentHomeView";
import StudentAssessmentsView from "./components/StudentAssessmentsView";
import StudentAttendanceView from "./components/StudentAttendanceView";
import StudentPerformanceView from "./components/StudentPerformanceView";
import StudentAchievementsView from "./components/StudentAchievementsView";
import StudentNotificationsView from "./components/StudentNotificationsView";

export default function StudentDashboard() {
    const { students, courses } = useLMS();
    const [currentUser, setCurrentUser] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Try getting from Context first, then LocalStorage
        const email = localStorage.getItem("currentStudentEmail");
        const storedName = localStorage.getItem("currentUserName");

        if (students.length > 0 && email) {
            const user = students.find(s => s.email === email);
            if (user) setCurrentUser(user);
        } else if (storedName) {
            // Fallback object if context is not yet loaded but we have login info
            setCurrentUser({
                id: 0,
                name: storedName,
                email: email || "",
                department: "Student",
                enrolledCourses: []
            } as any);
        }
    }, [students]);

    // Derived Data
    const myCourses = currentUser
        ? courses.filter(c => currentUser.enrolledCourses?.includes(c.id))
        : [];

    const searchResults = searchQuery
        ? courses.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : courses;

    if (!currentUser) return <div className="p-8 text-center text-neutral-500">Loading student profile...</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Welcome, {currentUser.name}</h1>
                    <p className="text-gray-500">Department: {currentUser.department || "General"}</p>
                </div>
            </div>

            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="flex flex-wrap gap-2 bg-transparent justify-start h-auto w-full">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800 rounded-full px-4"><Home className="w-4 h-4 mr-2" /> Dashboard</TabsTrigger>
                    <TabsTrigger value="my-courses" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-full px-4"><Book className="w-4 h-4 mr-2" /> My Courses</TabsTrigger>
                    <TabsTrigger value="assignments" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 rounded-full px-4"><FileText className="w-4 h-4 mr-2" /> Assignments</TabsTrigger>
                    <TabsTrigger value="assessments" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800 rounded-full px-4"><Activity className="w-4 h-4 mr-2" /> Assessments</TabsTrigger>
                    <TabsTrigger value="attendance" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800 rounded-full px-4"><CalendarCheck className="w-4 h-4 mr-2" /> Attendance</TabsTrigger>
                    <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-800 rounded-full px-4"><TrendingUp className="w-4 h-4 mr-2" /> Performance</TabsTrigger>
                    <TabsTrigger value="achievements" className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 rounded-full px-4"><Trophy className="w-4 h-4 mr-2" /> Achievements</TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800 rounded-full px-4"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
                </TabsList>

                {/* DASHBOARD */}
                <TabsContent value="dashboard" className="space-y-4">
                    <StudentHomeView />
                </TabsContent>

                {/* MY COURSES */}
                <TabsContent value="my-courses" className="space-y-4">
                    <h2 className="text-xl font-semibold">Enrolled Courses</h2>
                    {myCourses.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-500">You haven't been assigned any courses yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map(course => (
                                <Card key={course.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <Badge variant="secondary">{course.code}</Badge>
                                            <Badge variant="outline">{course.subject}</Badge>
                                        </div>
                                        <CardTitle className="mt-2">{course.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {course.description || "No description available."}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full">Continue Learning</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ASSIGNMENTS */}
                <TabsContent value="assignments" className="space-y-4">
                    <StudentAssignmentsView />
                </TabsContent>

                {/* ASSESSMENTS */}
                <TabsContent value="assessments" className="space-y-4">
                    <StudentAssessmentsView />
                </TabsContent>

                {/* ATTENDANCE */}
                <TabsContent value="attendance" className="space-y-4">
                    <StudentAttendanceView />
                </TabsContent>

                {/* PERFORMANCE */}
                <TabsContent value="performance" className="space-y-4">
                    <StudentPerformanceView />
                </TabsContent>

                {/* ACHIEVEMENTS */}
                <TabsContent value="achievements" className="space-y-4">
                    <StudentAchievementsView />
                </TabsContent>

                {/* NOTIFICATIONS */}
                <TabsContent value="notifications" className="space-y-4">
                    <StudentNotificationsView />
                </TabsContent>
            </Tabs>
        </div>
    );
}
