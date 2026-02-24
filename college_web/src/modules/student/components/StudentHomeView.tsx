import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Activity, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentHomeView() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [marksData, setMarksData] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Overview
                const overviewRes = await fetch(`${API_URL}/student/dashboard`, { headers: getAuthHeaders() });
                if (overviewRes.status === 401 || overviewRes.status === 403) {
                    toast.error("Session expired or unauthorized role. Redirecting to login...");
                    setTimeout(() => window.location.href = '/login', 2000);
                    return;
                }
                if (overviewRes.ok) {
                    const data = await overviewRes.json();
                    setStats(data.stats);
                }

                // Fetch Attendance for Graph
                const attRes = await fetch(`${API_URL}/student/attendance`, { headers: getAuthHeaders() });
                if (attRes.ok) {
                    const attList = await attRes.json();
                    // Process attendance per course
                    const courseAtt: any = {};
                    attList.forEach((record: any) => {
                        if (!courseAtt[record.subject_name]) {
                            courseAtt[record.subject_name] = { present: 0, total: 0 };
                        }
                        courseAtt[record.subject_name].total += 1;
                        if (record.status === 'Present') {
                            courseAtt[record.subject_name].present += 1;
                        }
                    });
                    const attGraph = Object.keys(courseAtt).map(subject => ({
                        subject,
                        percentage: Math.round((courseAtt[subject].present / courseAtt[subject].total) * 100)
                    }));
                    setAttendanceData(attGraph);
                }

                // Fetch Marks for Dashboard
                const marksRes = await fetch(`${API_URL}/student/marks`, { headers: getAuthHeaders() });
                if (marksRes.ok) {
                    const marksList = await marksRes.json();
                    const marksGraph = marksList.map((m: any) => ({
                        exam: `${m.exam_type} - ${m.subject_code}`,
                        score: Math.round((m.marks_obtained / m.max_marks) * 100)
                    }));
                    setMarksData(marksGraph);
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Overall Attendance</p>
                            <h3 className="text-2xl font-bold">{stats?.attendance || 0}%</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Estimated CGPA</p>
                            <h3 className="text-2xl font-bold">{stats?.cgpa || 'N/A'}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Courses</p>
                            <h3 className="text-2xl font-bold">Real time</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Tasks</p>
                            <h3 className="text-2xl font-bold">Check Assignments</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance per Course</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        {attendanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="subject" />
                                    <YAxis domain={[0, 100]} />
                                    <RechartsTooltip />
                                    <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No attendance data</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Marks Progression (%)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                        {marksData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={marksData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="exam" />
                                    <YAxis domain={[0, 100]} />
                                    <RechartsTooltip />
                                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No marks data</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
