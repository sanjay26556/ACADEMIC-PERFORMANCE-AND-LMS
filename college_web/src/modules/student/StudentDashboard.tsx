
import { useState, useEffect } from "react";
import { useLMS, Student } from "@/context/LMSContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Book, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
    const { students, courses } = useLMS();
    const [currentUser, setCurrentUser] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Mock session retrieval
        const email = localStorage.getItem("currentStudentEmail") || "john@student.com";
        const user = students.find(s => s.email === email);
        if (user) setCurrentUser(user);
    }, [students]);

    // Derived Data
    const myCourses = currentUser
        ? courses.filter(c => currentUser.enrolledCourses.includes(c.id))
        : [];

    const searchResults = searchQuery
        ? courses.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : courses;

    if (!currentUser) return <div className="p-8 text-center">Loading student profile... (Try logging in again)</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Welcome, {currentUser.name}</h1>
                    <p className="text-gray-500">Department: {currentUser.department}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/'}>Logout</Button>
            </div>

            <Tabs defaultValue="my-courses" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="my-courses" className="gap-2"><Book className="w-4 h-4" /> My Courses</TabsTrigger>
                    <TabsTrigger value="search" className="gap-2"><Search className="w-4 h-4" /> Browse All</TabsTrigger>
                </TabsList>

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

                {/* SEARCH */}
                <TabsContent value="search" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search courses by name, subject, or code..."
                            className="pl-10 h-12 text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map(course => (
                            <Card key={course.id} className="hover:shadow-md transition-shadow opacity-90 hover:opacity-100">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary">{course.code}</Badge>
                                        <Badge variant="outline">{course.subject}</Badge>
                                    </div>
                                    <CardTitle className="mt-2 text-lg">{course.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {course.description ? course.description.substring(0, 100) + "..." : ""}
                                    </p>
                                    {currentUser.enrolledCourses.includes(course.id) ? (
                                        <div className="text-green-600 text-sm font-medium flex items-center gap-1">
                                            <GraduationCap className="w-4 h-4" /> Enrolled
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-sm">Not Enrolled</div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
