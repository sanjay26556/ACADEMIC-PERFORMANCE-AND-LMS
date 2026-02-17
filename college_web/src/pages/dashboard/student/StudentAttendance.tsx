import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { student } from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function StudentAttendance() {
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        total: 0,
        percentage: 0
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await student.getAttendance();
            const data = res.data;
            setAttendanceData(data);

            // Calculate Stats
            const present = data.filter((r: any) => r.status === 'Present').length;
            const absent = data.filter((r: any) => r.status === 'Absent').length;
            const total = data.length;
            setStats({
                present,
                absent,
                total,
                percentage: total > 0 ? Math.round((present / total) * 100) : 0
            });
        } catch (error) {
            console.error("Failed to load attendance", error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-neutral-950">
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    // Chart Data Preparation
    const monthlyData = attendanceData.reduce((acc: any, curr: any) => {
        const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
        const found = acc.find((mmm: any) => mmm.month === month);
        if (found) {
            found.total++;
            if (curr.status === 'Present') found.present++;
        } else {
            acc.push({ month, total: 1, present: curr.status === 'Present' ? 1 : 0 });
        }
        return acc;
    }, []).map((m: any) => ({
        month: m.month,
        attendance: Math.round((m.present / m.total) * 100)
    }));

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
            <DashboardSidebar role="student" />
            <main className="ml-64 p-8 min-h-screen">
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Attendance</h1>
                        <p className="text-neutral-400">Track your daily presence and consistency.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Overall Attendance</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{stats.percentage}%</div>
                                <Progress value={stats.percentage} className="h-2 mt-3 bg-neutral-800" indicatorClassName={stats.percentage < 75 ? "bg-red-500" : "bg-emerald-500"} />
                            </CardContent>
                        </Card>

                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-400">Total Classes</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{stats.present} <span className="text-lg text-neutral-500 font-normal">/ {stats.total}</span></div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Attendance History List */}
                        <Card className="lg:col-span-2 bg-neutral-900/50 border-neutral-800">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {attendanceData.slice(0, 10).map((record: any, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/30 border border-neutral-800">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2 h-10 rounded-full", record.status === 'Present' ? "bg-emerald-500" : "bg-red-500")}></div>
                                                <div>
                                                    <div className="font-medium text-white">{record.subject_name}</div>
                                                    <div className="text-xs text-neutral-400 flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={cn(
                                                record.status === 'Present' ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"
                                            )}>
                                                {record.status}
                                            </Badge>
                                        </div>
                                    ))}
                                    {attendanceData.length === 0 && <div className="text-center text-neutral-500 py-8">No attendance records found.</div>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Calendar View */}
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader>
                                <CardTitle className="text-white">Calendar</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="rounded-md border border-neutral-800 bg-neutral-900 text-white"
                                    modifiers={{
                                        present: (date) => attendanceData.some(d => new Date(d.date).toDateString() === date.toDateString() && d.status === 'Present'),
                                        absent: (date) => attendanceData.some(d => new Date(d.date).toDateString() === date.toDateString() && d.status === 'Absent'),
                                    }}
                                    modifiersClassNames={{
                                        present: "bg-emerald-900/50 text-emerald-400 font-bold hover:bg-emerald-900/70",
                                        absent: "bg-red-900/50 text-red-400 font-bold hover:bg-red-900/70"
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
