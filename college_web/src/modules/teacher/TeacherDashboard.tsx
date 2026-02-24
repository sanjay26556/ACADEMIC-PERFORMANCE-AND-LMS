import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, BookOpen, Calendar, TrendingUp, Clock, Plus, Save, Search, CheckCircle, XCircle, Trash2, AlertTriangle, Mail } from "lucide-react";
import MarksManagement from "./MarksManagement";
import AssignmentsView from "./components/AssignmentsView";
import AssessmentsManager from "./components/AssessmentsManager";
import DashboardAnalytics from "./components/DashboardAnalytics";

// API Helper
const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function TeacherDashboard() {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "overview";

    return (
        <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans">
            <Sidebar role="teacher" />
            <div className="flex-1 ml-64 p-8 lg:p-12 transition-all">
                {activeTab === 'overview' && <DashboardOverview />}
                {activeTab === 'students' && <ManageStudents />}
                {activeTab === 'courses' && <MyCourses />}
                {activeTab === 'attendance' && <AttendanceTracker />}
                {activeTab === 'assignments' && <AssignmentsView />}
                {activeTab === 'assessments' && <AssessmentsManager />}
                {activeTab === 'marks' && <MarksManagement />}
                {activeTab === 'timetable' && <TimetableView />}
                {activeTab === 'notifications' && <NotificationsView />}
                {activeTab === 'reports' && <ReportsAnalytics />}
            </div>
        </div>
    );
}

function NotificationsView() {
    const [notifications, setNotifications] = useState([]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <div className="grid gap-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                        No new notifications.
                    </div>
                ) : (
                    notifications.map((n: any) => (
                        <Card key={n.id} className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-lg text-emerald-400">{n.title}</CardTitle>
                                    <span className="text-xs text-neutral-500">{n.time}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-neutral-300">{n.message}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function DashboardOverview() {
    const [stats, setStats] = useState({ courses: 0, students: 0 });
    const storedName = localStorage.getItem("currentUserName") || "Teacher";

    useEffect(() => {
        fetch(`${API_URL}/teacher/dashboard-stats`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Welcome, {storedName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.courses}</div>
                        <p className="text-xs text-neutral-500">Active courses</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.students}</div>
                        <p className="text-xs text-neutral-500">Enrolled across courses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <DashboardAnalytics />
        </div>
    );
}

function ManageStudents() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [students, setStudents] = useState([]);
    const [regNo, setRegNo] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch Courses
    useEffect(() => {
        fetch(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCourses(data);
                    if (data.length > 0) setSelectedCourse(String(data[0].id));
                }
            })
            .catch(err => toast.error("Failed to load courses"));
    }, []);

    // Fetch Students for Course
    const fetchStudents = () => {
        if (!selectedCourse) return;
        fetch(`${API_URL}/teacher/courses/${selectedCourse}/students`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStudents(data);
                else setStudents([]);
            })
            .catch(err => toast.error("Failed to load students"));
    };

    useEffect(() => {
        fetchStudents();
    }, [selectedCourse]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regNo || !selectedCourse) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/teacher/courses/${selectedCourse}/enroll`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ register_number: regNo })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setRegNo("");
                fetchStudents();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Failed to add student");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Manage Course Enrollments</h2>

            {/* Course Selector */}
            {courses.length > 0 ? (
                <div className="flex gap-4 items-center bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                    <Label className="text-neutral-400">Select Course:</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[300px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code}) - {c.year} Yr/Sem {c.semester}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="text-neutral-500">No courses found. Create a course first in "My Courses".</div>
            )}

            {selectedCourse && (
                <>
                    {/* Add Student Form */}
                    <Card className="bg-neutral-900/50 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Enroll Student</CardTitle>
                            <CardDescription>Enter Register Number to enroll student in selected course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddStudent} className="flex gap-4 items-center">
                                <div className="flex-1 max-w-sm">
                                    <Input
                                        placeholder="Enter Register Number (e.g., 21CSE001)"
                                        value={regNo}
                                        onChange={e => setRegNo(e.target.value)}
                                        className="bg-neutral-950/50 border-neutral-700"
                                    />
                                </div>
                                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                                    {loading ? "Adding..." : "Enroll Student"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Students List */}
                    <Card className="bg-neutral-900/40 border-neutral-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Enrolled Students ({students.length})</CardTitle>
                        </CardHeader>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-neutral-800">
                                    <TableHead className="text-neutral-400">Register No</TableHead>
                                    <TableHead className="text-neutral-400">Name</TableHead>
                                    <TableHead className="text-neutral-400">Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-neutral-500">
                                            No students enrolled yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((student: any) => (
                                        <TableRow key={student.id} className="border-neutral-800">
                                            <TableCell className="font-mono text-neutral-300">{student.register_number}</TableCell>
                                            <TableCell className="text-neutral-200">{student.name}</TableCell>
                                            <TableCell className="text-neutral-400">{student.email || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </>
            )}
        </div>
    );
}

function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Delete State
    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // New Course Form State
    const [newCourse, setNewCourse] = useState({
        name: "", code: "", year: "1", semester: "1", section: "A"
    });
    const [creating, setCreating] = useState(false);

    const fetchCourses = () => {
        fetch(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCourses(data);
                else setCourses([]);
            })
            .catch(err => toast.error("Failed to load courses"));
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = async () => {
        if (!newCourse.name || !newCourse.code) {
            toast.error("Please fill all fields");
            return;
        }
        setCreating(true);
        try {
            const res = await fetch(`${API_URL}/teacher/courses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newCourse)
            });
            if (res.ok) {
                toast.success("Course created successfully");
                setIsAddOpen(false);
                setNewCourse({ name: "", code: "", year: "1", semester: "1", section: "A" });
                fetchCourses();
            } else {
                toast.error("Failed to create course");
            }
        } catch (err) {
            toast.error("Error creating course");
        } finally {
            setCreating(false);
        }
    };

    const confirmDelete = (courseId: string) => {
        setDeleteCourseId(courseId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteCourse = async () => {
        if (!deleteCourseId) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/teacher/courses/${deleteCourseId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (res.ok) {
                toast.success("Course deleted successfully");
                setCourses(courses.filter((c: any) => String(c.id) !== deleteCourseId));
                setDeleteDialogOpen(false);
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete course");
            }
        } catch (err) {
            toast.error("Error deleting course");
        } finally {
            setDeleting(false);
            setDeleteCourseId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Courses</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-950 border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create New Course</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Enter the details below to create a new course.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Course Name</Label>
                                    <Input
                                        placeholder="e.g. Mathematics I"
                                        value={newCourse.name}
                                        onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                                        className="bg-neutral-900 border-neutral-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Course Code</Label>
                                    <Input
                                        placeholder="e.g. MAT101"
                                        value={newCourse.code}
                                        onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                        className="bg-neutral-900 border-neutral-700"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Select value={newCourse.year} onValueChange={v => setNewCourse({ ...newCourse, year: v })}>
                                        <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Semester</Label>
                                    <Select value={newCourse.semester} onValueChange={v => setNewCourse({ ...newCourse, semester: v })}>
                                        <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select value={newCourse.section} onValueChange={v => setNewCourse({ ...newCourse, section: v })}>
                                        <SelectTrigger className="bg-neutral-900 border-neutral-700"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['A', 'B', 'C', 'D'].map(s => <SelectItem key={s} value={s}>Sec {s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateCourse} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                                {creating ? "Creating..." : "Create Course"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                        No courses created yet. Click "Add Course" to get started.
                    </div>
                ) : (
                    courses.map((course: any) => (
                        <Card key={course.id} className="bg-neutral-900/50 border-neutral-800 hover:border-emerald-500/50 transition-colors group relative">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg text-emerald-400">{course.name}</CardTitle>
                                        <CardDescription>{course.code}</CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-400 font-mono">
                                            {course.year} - {course.section}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-neutral-400 mt-2">
                                    <span>Semester {course.semester}</span>
                                    <span>Year {course.year}</span>
                                </div>
                            </CardContent>

                            {/* Hover Delete Button */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 bg-red-900/50 hover:bg-red-600 border border-red-800/50"
                                    onClick={() => confirmDelete(String(course.id))}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-neutral-950 border-neutral-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            This action cannot be undone. This will permanently delete the course "{courses.find((c: any) => String(c.id) === deleteCourseId)?.name}"
                            and remove all associated student enrollments, marks, and attendance data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Course"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function AttendanceTracker() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [students, setStudents] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});

    useEffect(() => {
        fetch(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCourses(data);
                    if (data.length > 0) setSelectedCourse(String(data[0].id));
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        fetch(`${API_URL}/teacher/courses/${selectedCourse}/students`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                const initialAuth: Record<string, string> = {};
                data.forEach((s: any) => initialAuth[s.id] = "Present");
                setAttendance(initialAuth);
            })
            .catch(err => console.error(err));
    }, [selectedCourse]);

    const submitAttendance = async () => {
        if (!selectedCourse) {
            toast.error("Please select a course");
            return;
        }

        const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status
        }));

        try {
            const res = await fetch(`${API_URL}/teacher/attendance`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    course_id: parseInt(selectedCourse),
                    date,
                    attendance_data: attendanceData
                })
            });
            if (res.ok) toast.success("Attendance marked successfully");
            else throw new Error();
        } catch (err) {
            toast.error("Failed to submit attendance");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Attendance Tracker</h2>
                <div className="flex gap-4">
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-neutral-900 border-neutral-700 w-40" />
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[300px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedCourse ? (
                <Card className="bg-neutral-900/40 border-neutral-800">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-neutral-400">Register No</TableHead>
                                <TableHead className="text-neutral-400">Student Name</TableHead>
                                <TableHead className="text-center text-neutral-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-neutral-500">
                                        No students enrolled in this course.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student: any) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono text-neutral-300">{student.register_number}</TableCell>
                                        <TableCell className="text-neutral-200">{student.name}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                {['Present', 'Absent', 'On Duty'].map(status => (
                                                    <Button
                                                        key={status}
                                                        size="sm"
                                                        variant={attendance[student.id] === status ? (status === 'Absent' ? 'destructive' : 'default') : 'outline'}
                                                        className={attendance[student.id] === status ? (status === 'Present' ? 'bg-emerald-600 hover:bg-emerald-700' : '') : 'border-neutral-700 hover:bg-neutral-800'}
                                                        onClick={() => setAttendance({ ...attendance, [student.id]: status })}
                                                    >
                                                        {status}
                                                    </Button>
                                                ))}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <div className="p-4 flex justify-end">
                        <Button onClick={submitAttendance} className="bg-white text-black hover:bg-neutral-200">
                            <Save className="mr-2 h-4 w-4" /> Save Attendance
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                    Select a course to mark attendance
                </div>
            )}
        </div>
    );
}

function TimetableView() {
    const [timetable, setTimetable] = useState([]);

    useEffect(() => {
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Timetable</h2>
            <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                Time table feature coming soon.
            </div>
        </div>
    );
}

function ReportsAnalytics() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/teacher/analytics`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error("Failed to load analytics");
                setLoading(false);
            });
    }, []);

    const sendAlert = async (type: 'attendance' | 'marks', studentId?: number) => {
        // If studentId valid, send to that one. Else, send to all 'at risk' for that type.
        let targets = [];
        if (studentId) {
            targets = [students.find((s: any) => s.student_id === studentId)?.user_id];
        } else {
            // Bulk send
            if (Array.isArray(students)) {
                targets = students
                    .filter((s: any) => {
                        if (type === 'attendance') return parseFloat(s.attendance_pct) < 75;
                        if (type === 'marks') return parseFloat(s.marks_pct) < 50;
                        return false;
                    })
                    .map((s: any) => s.user_id);
            }
        }

        if (targets.length === 0) {
            toast.info("No students found for this alert.");
            return;
        }

        setSending(true);
        try {
            const res = await fetch(`${API_URL}/teacher/notifications/send-alerts`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ student_ids: targets, type })
            });
            if (res.ok) {
                toast.success(`Alerts sent to ${targets.length} student(s)`);
            } else {
                toast.error("Failed to send alerts");
            }
        } catch (err) {
            toast.error("Error sending alerts");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
                <div className="flex gap-2">
                    <Button
                        onClick={() => sendAlert('attendance')}
                        disabled={sending}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-950/30"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" /> Alert Low Attendance
                    </Button>
                    <Button
                        onClick={() => sendAlert('marks')}
                        disabled={sending}
                        variant="outline"
                        className="border-amber-500/50 text-amber-400 hover:bg-amber-950/30"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" /> Alert Low Marks
                    </Button>
                </div>
            </div>

            <Card className="bg-neutral-900/40 border-neutral-800">
                <CardHeader>
                    <CardTitle>Student Performance Overview</CardTitle>
                    <CardDescription>Overall performance across all your courses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-800">
                                <TableHead className="text-neutral-400">Register No</TableHead>
                                <TableHead className="text-neutral-400">Name</TableHead>
                                <TableHead className="text-center text-neutral-400">Overall Attendance</TableHead>
                                <TableHead className="text-center text-neutral-400">Overall Marks</TableHead>
                                <TableHead className="text-right text-neutral-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Loading analytics...</TableCell>
                                </TableRow>
                            ) : !Array.isArray(students) || students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                                        {!Array.isArray(students) ? "Failed to load data. Please try again." : "No students found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((s: any) => {
                                    const lowAtt = parseFloat(s.attendance_pct) < 75;
                                    const lowMarks = parseFloat(s.marks_pct) < 50;
                                    return (
                                        <TableRow key={s.student_id} className="border-neutral-800">
                                            <TableCell className="font-mono text-neutral-300">{s.register_number}</TableCell>
                                            <TableCell className="text-neutral-200">{s.name}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${lowAtt ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {s.attendance_pct}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${lowMarks ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                    {s.marks_pct}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(lowAtt || lowMarks) && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                                                            title="Send Individual Alert"
                                                            onClick={() => sendAlert(lowAtt ? 'attendance' : 'marks', s.student_id)}
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
