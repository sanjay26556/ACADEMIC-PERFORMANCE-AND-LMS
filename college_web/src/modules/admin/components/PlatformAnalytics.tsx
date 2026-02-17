
import { useMemo, useState, useEffect } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
    TrendingUp, TrendingDown, Users, IndianRupee, Activity,
    Zap, Globe, Server, ArrowUpRight, BarChart3, PieChart as PieChartIcon, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const USER_GROWTH_DATA = [
    { month: "Jan", students: 1200, teachers: 50 },
    { month: "Feb", students: 1320, teachers: 55 },
    { month: "Mar", students: 1450, teachers: 62 },
    { month: "Apr", students: 1600, teachers: 65 },
    { month: "May", students: 1880, teachers: 75 },
    { month: "Jun", students: 2100, teachers: 85 },
    { month: "Jul", students: 2450, teachers: 95 },
];

const REVENUE_DATA = [
    { name: "Course Fees", value: 8500000, color: "#06b6d4" }, // Cyan
    { name: "Grants", value: 2500000, color: "#8b5cf6" },      // Purple
    { name: "Partnerships", value: 1000000, color: "#f59e0b" }, // Orange
    { name: "Donations", value: 500000, color: "#10b981" },     // Green
]; // Total = 1.25 Cr

const DEPT_PERFORMANCE = [
    { dept: "CS", score: 92, activity: 85 },
    { dept: "ECE", score: 88, activity: 78 },
    { dept: "Mech", score: 85, activity: 70 },
    { dept: "Civil", score: 82, activity: 65 },
    { dept: "EEE", score: 90, activity: 80 },
];

const SYSTEM_TRAFFIC = [
    { time: "00:00", users: 120 },
    { time: "04:00", users: 80 },
    { time: "08:00", users: 450 },
    { time: "12:00", users: 980 },
    { time: "16:00", users: 850 },
    { time: "20:00", users: 400 },
    { time: "23:59", users: 150 },
];

export function PlatformAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:5000/admin/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) {
                console.error("Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <div className="p-8 text-center text-neutral-400">Loading analytics...</div>;
    }

    // Map API data to chart formats if needed, or use directly
    const userGrowthData = data.userGrowth || USER_GROWTH_DATA;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Title Section */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-cyan-400" />
                        Platform Analytics
                    </h2>
                    <p className="text-neutral-400 mt-1">Real-time system performance and growth metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-3 py-1">
                        <Activity className="w-3 h-3 mr-2 animate-pulse" /> Live Data
                    </Badge>
                </div>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Total Revenue */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <IndianRupee className="w-24 h-24 text-cyan-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">₹{(data.totalRevenue / 10000000).toFixed(2)} Cr</div>
                        <div className="flex items-center text-xs text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12.5% vs last month
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50" />
                </Card>

                {/* Card 2: Active Users */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-purple-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{data.activeUsers}</div>
                        <div className="flex items-center text-xs text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +8.2% new signups
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
                </Card>

                {/* Card 3: Server Load */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Server className="w-24 h-24 text-orange-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Server Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{data.serverLoad}%</div>
                        <div className="flex items-center text-xs text-orange-400">
                            <Activity className="w-3 h-3 mr-1" />
                            Optimal performance
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 opacity-50" />
                </Card>

                {/* Card 4: Global Reach */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe className="w-24 h-24 text-green-500 -mt-2 -mr-2" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-400">Global Reach</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{data.globalReach}</div>
                        <div className="flex items-center text-xs text-blue-400">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Departments Active
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-50" />
                </Card>
            </div>

            {/* Main Chart Section - Growth & Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart (Area) - Spans 2 cols */}
                <Card className="lg:col-span-2 bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            User Growth Trajectory
                        </CardTitle>
                        <CardDescription className="text-neutral-400">Monthly breakdown of student and teacher registrations</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowthData}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="month" stroke="#666" tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px" }}
                                    itemStyle={{ color: "#fff" }}
                                />
                                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                <Area type="monotone" dataKey="students" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                                <Area type="monotone" dataKey="teachers" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTeachers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue Pie Chart - 1 col */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-purple-400" />
                            Revenue Sources
                        </CardTitle>
                        <CardDescription className="text-neutral-400">Distribution of platform income</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={REVENUE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {REVENUE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `₹${(value / 100000).toFixed(1)} Lakhs`}
                                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">₹1.25 Cr</div>
                                <div className="text-xs text-neutral-500">Total</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Charts - Dept Performance & Traffic */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Dept Performance Bar Chart */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Departmental Performance</CardTitle>
                        <CardDescription className="text-neutral-400">Average scoring and activity levels</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DEPT_PERFORMANCE} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                <XAxis type="number" stroke="#666" domain={[0, 100]} hide />
                                <YAxis dataKey="dept" type="category" stroke="#999" tickLine={false} axisLine={false} width={50} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px" }}
                                />
                                <Legend />
                                <Bar dataKey="score" name="Avg Score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="activity" name="Activity %" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* System Traffic Line Chart */}
                <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Live System Traffic</CardTitle>
                        <CardDescription className="text-neutral-400">Concurrent users over the last 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={SYSTEM_TRAFFIC}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="time" stroke="#666" tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", borderRadius: "8px" }}
                                />
                                <Line type="monotone" dataKey="users" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#000", stroke: "#f59e0b", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#f59e0b" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
