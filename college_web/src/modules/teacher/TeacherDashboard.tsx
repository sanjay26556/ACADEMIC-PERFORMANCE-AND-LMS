import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, BookOpen, Calendar, TrendingUp, Clock, Plus, Save, Search, CheckCircle, XCircle } from "lucide-react";
import MarksManagement from "./MarksManagement";




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
                {activeTab === 'marks' && <MarksManagement />}

                {activeTab === 'timetable' && <TimetableView />}
                {activeTab === 'notifications' && <NotificationsView />}
            </div>
        </div>
    );
}

function NotificationsView() {
    // Mock notifications for now
    const notifications = [
        { id: 1, title: "System Update", message: "The LMS will be under maintenance on Sunday.", time: "2 hours ago", type: "system" },
        { id: 2, title: "New Message", message: "Admin has sent you a message regarding the schedule.", time: "1 day ago", type: "message" },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <div className="grid gap-4">
                {notifications.map(n => (
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
                ))}
            </div>
        </div>
    );
}

// ... existing components


function DashboardOverview() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Classes</CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">4</div>
                        <p className="text-xs text-neutral-500">Active subjects</p>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/50 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Pending Attendance</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">2</div>
                        <p className="text-xs text-neutral-500">Classes today</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ManageStudents() {
    const [students, setStudents] = useState([]);
    const [regNo, setRegNo] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch my students
    const fetchMyStudents = () => {
        fetch(`${API_URL}/teacher/my-students`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStudents(data);
            })
            .catch(err => toast.error("Failed to load students"));
    };

    useEffect(() => {
        fetchMyStudents();
    }, []);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regNo) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/teacher/add-student`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ register_number: regNo })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                setRegNo("");
                fetchMyStudents();
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
            <h2 className="text-2xl font-bold text-white">Manage My Class</h2>

            {/* Add Student Form */}
            <Card className="bg-neutral-900/50 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg">Add Student to Class</CardTitle>
                    <CardDescription>Enter the student's Register Number to add them to your list.</CardDescription>
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
                            {loading ? "Adding..." : "Add Student"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Students List */}
            <Card className="bg-neutral-900/40 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-lg">My Students ({students.length})</CardTitle>
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
                                    No students added yet. Add students using their Register Number.
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
        </div>
    );
}

function MyCourses() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCourses(data);
                else {
                    console.error("Expected array for courses, got:", data);
                    setCourses([]);
                }
            })
            .catch(err => toast.error("Failed to load courses"));
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                    <Card key={course.id} className="bg-neutral-900/50 border-neutral-800 hover:border-emerald-500/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="text-lg text-emerald-400">{course.name}</CardTitle>
                            <CardDescription>{course.code}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-neutral-400">Semester: {course.semester}</div>
                            <div className="text-sm text-neutral-400">Credits: {course.credits}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
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
        // Load Courses
        fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCourses(data);
            })
            .catch(err => console.error(err));

        // Load My Students for Attendance
        fetch(`${API_URL}/teacher/my-students`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                // Initialize attendance
                const initialAuth: Record<string, string> = {};
                data.forEach((s: any) => initialAuth[s.id] = "Present");
                setAttendance(initialAuth);
            })
            .catch(err => console.error("Failed to load students"));
    }, []);

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
                    subject_id: parseInt(selectedCourse),
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
                    <Select onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[200px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
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
                            {students.map((student: any) => (
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
                            ))}
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

function MarksEntry() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [examType, setExamType] = useState("Internal 1");
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState<Record<string, string>>({});

    useEffect(() => {
        // Load Courses
        fetch(`${API_URL}/teacher/classes`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCourses(data);
            })
            .catch(err => console.error(err));

        // Load My Students for Marks
        fetch(`${API_URL}/teacher/my-students`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => console.error("Failed to load students"));
    }, []);

    const submitMarks = async () => {
        if (!selectedCourse) {
            toast.error("Please select a course");
            return;
        }

        const marksData = Object.entries(marks).map(([studentId, score]) => ({
            student_id: parseInt(studentId),
            marks_obtained: parseFloat(score)
        }));

        try {
            const res = await fetch(`${API_URL}/teacher/marks`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    subject_id: parseInt(selectedCourse),
                    exam_type: examType,
                    max_marks: 100, // Default to 100 type
                    marks_data: marksData
                })
            });
            if (res.ok) toast.success("Marks uploaded successfully");
            else throw new Error();
        } catch (err) {
            toast.error("Failed to submit marks");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Internal Marks Entry</h2>
                <div className="flex gap-4">
                    <Select value={examType} onValueChange={setExamType}>
                        <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder="Exam Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Internal 1">Internal 1</SelectItem>
                            <SelectItem value="Internal 2">Internal 2</SelectItem>
                            <SelectItem value="Semester">Semester</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[200px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder="Select Course" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
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
                                <TableHead className="text-right text-neutral-400">Marks (out of 100)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student: any) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-mono text-neutral-300">{student.register_number}</TableCell>
                                    <TableCell className="text-neutral-200">{student.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Input
                                            type="number"
                                            className="w-24 ml-auto bg-neutral-800 border-neutral-600"
                                            value={marks[student.id] || ''}
                                            onChange={e => setMarks({ ...marks, [student.id]: e.target.value })}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="p-4 flex justify-end">
                        <Button onClick={submitMarks} className="bg-white text-black hover:bg-neutral-200">
                            <Save className="mr-2 h-4 w-4" /> Save Marks
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                    Select a course to enter marks
                </div>
            )}
        </div>
    );
}

function TimetableView() {
    const [timetable, setTimetable] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/teacher/timetable`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTimetable(data);
                else setTimetable([]);
            })
            .catch(err => toast.error("Failed to load timetable"));
    }, []);

    // Helper to organize by day/hour
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Timetable</h2>
                <Button variant="outline" className="border-neutral-700">
                    <Plus className="mr-2 h-4 w-4" /> Request Change
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {days.map(day => {
                    const dayClasses = timetable.filter((t: any) => t.day_of_week === day);
                    return (
                        <Card key={day} className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="pb-3 border-b border-neutral-800/50">
                                <CardTitle className="text-center text-lg">{day}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {dayClasses.length === 0 ? (
                                    <div className="text-center text-neutral-600 text-sm py-8">Free Day</div>
                                ) : (
                                    dayClasses.map((t: any) => (
                                        <div key={t.id} className="p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                                            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                                                <Clock className="w-3 h-3" />
                                                {t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)}
                                            </div>
                                            <div className="font-semibold text-emerald-400 text-sm">{t.subject_name}</div>
                                            <div className="text-xs text-neutral-500 mt-1">Room: {t.room_number || 'N/A'}</div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

