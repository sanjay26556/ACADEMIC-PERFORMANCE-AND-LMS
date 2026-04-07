import { useMemo } from "react";
import { useLMS } from "@/context/LMSContext";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Users, Activity,
    GraduationCap, Building2, BarChart3, PieChart as PieChartIcon,
} from "lucide-react";

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];

export function PlatformAnalytics() {
    const { students, teachers, isLoading } = useLMS();

    const studentCount = students.length;
    const staffCount = teachers.length;
    const activeTeachers = teachers.length; // Assuming all listed teachers are active

    // Calculate students per department
    const studentsPerDeptData = useMemo(() => {
        const counts: Record<string, number> = {};
        students.forEach(s => {
            const dept = s.department || 'Unknown';
            counts[dept] = (counts[dept] || 0) + 1;
        });
        return Object.keys(counts).map((key, index) => ({
            name: key,
            value: counts[key],
            color: COLORS[index % COLORS.length]
        }));
    }, [students]);

    // Calculate staff per department
    const staffPerDeptData = useMemo(() => {
        const counts: Record<string, number> = {};
        teachers.forEach(t => {
            const dept = t.department || 'Unknown';
            counts[dept] = (counts[dept] || 0) + 1;
        });
        return Object.keys(counts).map((key) => ({
            dept: key,
            staff: counts[key]
        }));
    }, [teachers]);

    if (isLoading) {
        return <div className="p-8 text-center text-neutral-400">Loading analytics...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-cyan-400" />
                        Platform Analytics
                    </h2>
                    <p className="text-neutral-400 mt-1">Real-time system performance and demographic metrics.</p>
                </div>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Students */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <GraduationCap className="w-24 h-24 text-cyan-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{studentCount}</div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50" />
                </Card>

                {/* Total Staff */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Building2 className="w-24 h-24 text-purple-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{staffCount}</div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
                </Card>

                {/* Active Teachers */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-orange-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Active Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{activeTeachers}</div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-50" />
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Students per Department Pie Chart */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-cyan-400" />
                            Students Per Department
                        </CardTitle>
                        <CardDescription className="text-neutral-400">Distribution of students across departments</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] relative">
                        {studentsPerDeptData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={studentsPerDeptData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {studentsPerDeptData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-500">No student data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Staff per Department Bar Chart */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Staff Per Department</CardTitle>
                        <CardDescription className="text-neutral-400">Number of teachers and staff by department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {staffPerDeptData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={staffPerDeptData} margin={{ top: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="dept" stroke="#999" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px" }}
                                    />
                                    <Bar dataKey="staff" name="Total Staff" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-500">No staff data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
