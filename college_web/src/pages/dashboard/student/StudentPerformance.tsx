
import { useState, useMemo } from "react";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import {
    TrendingUp, TrendingDown, Award, BookOpen, Target,
    Zap, AlertCircle, ArrowRight, BarChart2, Layers,
    Calendar, GraduationCap, Trophy, ChevronRight,
    Clock, Flame, CheckCircle2, Layout, FileText, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardSidebar from "@/components/dashboard/Sidebar";

// --- MOCK DATA ---

const SEMESTERS = [
    { id: "sem1", name: "Semester 1", year: "2023 Fall" },
    { id: "sem2", name: "Semester 2", year: "2024 Spring" },
    { id: "sem3", name: "Semester 3", year: "2024 Fall" },
    { id: "sem4", name: "Semester 4", year: "2025 Spring" },
    { id: "sem5", name: "Semester 5", year: "2025 Fall" }, // Current
];

// Complex mock data structure
const DEFAULT_SEM_DATA = {
    overview: {
        gpa: 8.9,
        credits: 22,
        rank: "Top 8%",
        trend: "+0.4", // vs previous sem
        bestCourse: "Adv. Algorithms",
        weakestCourse: "OS Theory",
        percentile: 92
    },
    courses: [
        {
            id: "c1", name: "Adv. Algorithms", code: "CS501", credits: 4,
            assessments: [
                { name: "UT1", marks: 18, max: 20 },
                { name: "UT2", marks: 19, max: 20 },
                { name: "Model", marks: 95, max: 100 },
                { name: "Final", marks: 92, max: 100 }
            ],
            internal: 45, internalMax: 50,
            external: 47, externalMax: 50,
            grade: "O"
        },
        {
            id: "c2", name: "OS Theory", code: "CS502", credits: 3,
            assessments: [
                { name: "UT1", marks: 12, max: 20 },
                { name: "UT2", marks: 14, max: 20 },
                { name: "Model", marks: 75, max: 100 },
                { name: "Final", marks: 78, max: 100 }
            ],
            internal: 35, internalMax: 50,
            external: 38, externalMax: 50,
            grade: "B+"
        },
        {
            id: "c3", name: "Computer Networks", code: "CS503", credits: 3,
            assessments: [
                { name: "UT1", marks: 16, max: 20 },
                { name: "UT2", marks: 17, max: 20 },
                { name: "Model", marks: 88, max: 100 },
                { name: "Final", marks: 85, max: 100 }
            ],
            internal: 42, internalMax: 50,
            external: 43, externalMax: 50,
            grade: "A+"
        },
        {
            id: "c4", name: "Web Frameworks", code: "CS504", credits: 4,
            assessments: [
                { name: "UT1", marks: 19, max: 20 },
                { name: "UT2", marks: 20, max: 20 },
                { name: "Model", marks: 92, max: 100 },
                { name: "Final", marks: 94, max: 100 }
            ],
            internal: 48, internalMax: 50,
            external: 48, externalMax: 50,
            grade: "O"
        }
    ],
    gradeDist: [
        { name: "O (Outstanding)", value: 2, color: "#22c55e" },
        { name: "A+ (Excellent)", value: 1, color: "#3b82f6" },
        { name: "B+ (Good)", value: 1, color: "#eab308" },
        { name: "Fail", value: 0, color: "#ef4444" },
    ],
    insights: {
        strengths: ["Algorithms", "Web Dev"],
        improvements: ["Operating Systems"],
        feedback: [
            "Your Algorithms score is in the top 1% of the class.",
            "OS Theory showed a 5% dip since Unit Test 1.",
            "Excellent consistency in Web Frameworks lab."
        ]
    }
};

const PERFORMANCE_DATA = {
    "sem5": DEFAULT_SEM_DATA,
    // Mock for other semesters for "Compare" mode
    "sem4": { ...DEFAULT_SEM_DATA, overview: { ...DEFAULT_SEM_DATA.overview, gpa: 8.5 } },
    "sem3": { ...DEFAULT_SEM_DATA, overview: { ...DEFAULT_SEM_DATA.overview, gpa: 8.2 } },
    "sem2": { ...DEFAULT_SEM_DATA, overview: { ...DEFAULT_SEM_DATA.overview, gpa: 8.4 } },
    "sem1": { ...DEFAULT_SEM_DATA, overview: { ...DEFAULT_SEM_DATA.overview, gpa: 7.9 } }
};

const COMPARE_DATA = [
    { sem: "Sem 1", gpa: 7.9 },
    { sem: "Sem 2", gpa: 8.4 },
    { sem: "Sem 3", gpa: 8.2 },
    { sem: "Sem 4", gpa: 8.5 },
    { sem: "Sem 5", gpa: 8.9 },
];

const COLORS = {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    slate: "#64748b"
};

const LMS_PERFORMANCE_DATA = {
    overview: {
        completion: 78,
        assessments: 12,
        hoursLogged: 45.5,
        attendance: 92,
        streak: 5
    },
    courses: [
        { id: "c1", name: "Data Structures", completion: 85, lastActive: "2 hours ago" },
        { id: "c2", name: "Operating Systems", completion: 60, lastActive: "1 day ago" },
        { id: "c3", name: "Database Mgmt", completion: 45, lastActive: "3 days ago" },
        { id: "c4", name: "Computer Networks", completion: 90, lastActive: "5 hours ago" }
    ],
    assessments: [
        { id: "a1", name: "DSA Quiz 1", score: 85, attempts: 1, status: "Pass" },
        { id: "a2", name: "OS Midterm", score: 72, attempts: 2, status: "Pass" },
        { id: "a3", name: "DBMS Quiz 2", score: 92, attempts: 1, status: "Pass" },
        { id: "a4", name: "CN Lab Quiz", score: 45, attempts: 1, status: "Fail" }
    ],
    modules: [
        { name: "Trees & Graphs", completion: 100, status: "Completed" },
        { name: "Process Scheduling", completion: 80, status: "In Progress" },
        { name: "Normalization", completion: 20, status: "In Progress" },
        { name: "TCP/IP Protocol", completion: 0, status: "Not Started" }
    ],
    timeUsage: [
        { date: "Mon", hours: 2.5 },
        { date: "Tue", hours: 4.0 },
        { date: "Wed", hours: 1.5 },
        { date: "Thu", hours: 3.5 },
        { date: "Fri", hours: 5.0 },
        { date: "Sat", hours: 6.5 },
        { date: "Sun", hours: 2.0 }
    ],
    contentCategories: [
        { name: "Videos", value: 45, color: "#3b82f6" },
        { name: "Docs", value: 25, color: "#8b5cf6" },
        { name: "Quizzes", value: 20, color: "#f59e0b" },
        { name: "Assignments", value: 10, color: "#22c55e" }
    ]
};

// --- SUB-COMPONENTS ---

const CourseMarkCard = ({ course }: { course: any }) => {
    // Normalize assessment marks to 100 for percentage
    const normalizedData = course.assessments.map((a: any) => ({
        name: a.name,
        score: (a.marks / a.max) * 100,
        raw: a.marks,
        max: a.max
    }));

    return (
        <Card className="bg-black/40 border-white/10 hover:border-primary/30 transition-all group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{course.name}</CardTitle>
                        <CardDescription>{course.code} • {course.credits} Credits</CardDescription>
                    </div>
                    <Badge variant={course.grade === "O" ? "default" : "outline"} className="text-lg w-12 h-12 flex items-center justify-center rounded-lg">
                        {course.grade}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="trend" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white/5 h-9">
                        <TabsTrigger value="trend" className="text-xs">Trend</TabsTrigger>
                        <TabsTrigger value="marks" className="text-xs">Marks</TabsTrigger>
                        <TabsTrigger value="split" className="text-xs">Split</TabsTrigger>
                    </TabsList>

                    <TabsContent value="trend" className="h-[150px] mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={normalizedData}>
                                <defs>
                                    <linearGradient id={`grad-${course.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke={COLORS.primary}
                                    fillOpacity={1}
                                    fill={`url(#grad-${course.id})`}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="marks" className="space-y-2 mt-2">
                        {course.assessments.map((a: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">{a.name}</span>
                                <div className="flex items-center gap-2">
                                    <Progress value={(a.marks / a.max) * 100} className="w-16 h-2" />
                                    <span className="w-12 text-right font-medium">{a.marks}/{a.max}</span>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="split" className="space-y-4 mt-2">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Internal ({course.internal}/{course.internalMax})</span>
                                <span>External ({course.external}/{course.externalMax})</span>
                            </div>
                            <div className="flex h-4 w-full overflow-hidden rounded-full bg-secondary/20">
                                <div
                                    className="bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground"
                                    style={{ width: `${(course.internal / (course.internalMax + course.externalMax)) * 100}%` }}
                                >
                                    I
                                </div>
                                <div
                                    className="bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground"
                                    style={{ width: `${(course.external / (course.internalMax + course.externalMax)) * 100}%` }}
                                >
                                    E
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic text-center">
                            Total Score: {course.internal + course.external} / 100
                        </p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const StudentPerformance = () => {
    const [selectedSemId, setSelectedSemId] = useState("sem5");
    const [compareMode, setCompareMode] = useState(false);

    // Get current semester data
    const semData = useMemo(() => {
        // Fallback to sem5 if data missing for mocked tabs
        return PERFORMANCE_DATA[selectedSemId as keyof typeof PERFORMANCE_DATA] || PERFORMANCE_DATA["sem5"];
    }, [selectedSemId]);

    // Prepare Comparison Chart Data for "Live Trend" (All courses lines)
    const comparisonChartData = useMemo(() => {
        const categories = ["UT1", "UT2", "Model", "Final"];
        return categories.map(cat => {
            const point: any = { name: cat };
            semData.courses.forEach(c => {
                const assessment = c.assessments.find(a => a.name === cat);
                if (assessment) {
                    // Normalize all to percentage for fair comparison
                    point[c.name] = (assessment.marks / assessment.max) * 100;
                }
            });
            return point;
        });
    }, [semData]);

    const COURSE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#22c55e"];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <DashboardSidebar role="student" />
            <main className="ml-64 p-8 min-h-screen">
                <div className="space-y-8 animate-in fade-in duration-500 pb-20">

                    {/* RE-IMPLEMENTING TABS STRUCTURE PROPERLY */}
                    <Tabs defaultValue="normal" className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 -mt-20 mb-8 sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b border-border/40">
                            <div>
                                <h1 className="text-3xl font-bold font-display glow-text">Performance</h1>
                                <p className="text-muted-foreground mt-1">Review your academic and LMS performance</p>
                            </div>
                            <TabsList className="grid w-[300px] grid-cols-2 bg-black/40 border border-white/10">
                                <TabsTrigger value="normal">Academic</TabsTrigger>
                                <TabsTrigger value="lms">LMS</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="normal" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Controls for Normal View */}
                            <div className="flex justify-end gap-3 mb-6">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-muted-foreground">Compare Semesters</span>
                                    <Button
                                        variant={compareMode ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCompareMode(!compareMode)}
                                        className="h-8"
                                    >
                                        {compareMode ? "On" : "Off"}
                                    </Button>
                                </div>
                                <Select value={selectedSemId} onValueChange={setSelectedSemId}>
                                    <SelectTrigger className="w-[180px] bg-black/40 border-white/10">
                                        <SelectValue placeholder="Select Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEMESTERS.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.year})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {compareMode ? (
                                // --- COMPARE SEMESTERS VIEW ---
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                                    <Card className="bg-black/40 border-white/10 lg:col-span-2">
                                        <CardHeader>
                                            <CardTitle>GPA Trajectory</CardTitle>
                                            <CardDescription>Academic performance evolution over your degree</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={COMPARE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                    <XAxis dataKey="sem" stroke="#888" tickLine={false} axisLine={false} />
                                                    <YAxis domain={[0, 10]} stroke="#888" tickLine={false} axisLine={false} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "8px" }}
                                                    />
                                                    <Area type="monotone" dataKey="gpa" stroke={COLORS.success} strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    <div className="bg-muted/10 border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center lg:col-span-2">
                                        <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
                                        <h3 className="text-xl font-medium">Consistent Improvement Detected</h3>
                                        <p className="text-muted-foreground max-w-md mt-2">
                                            Your GPA has increased by an average of 0.25 points each semester.
                                            If this trend continues, you are projected to graduate with a 9.1 CGPA.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                // --- SINGLE SEMESTER VIEW (Original) ---
                                <div className="space-y-8">
                                    {/* 1. OVERVIEW CARDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card className="bg-gradient-to-br from-blue-900/20 to-black/40 border-blue-500/20 backdrop-blur-md relative overflow-hidden">
                                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-blue-300">GPA</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-4xl font-bold font-display">{semData.overview.gpa}</div>
                                                <div className="flex items-center text-xs text-blue-300/80 mt-1">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    {semData.overview.trend} vs last sem
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Class Rank</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold text-white flex items-center gap-2">
                                                    <Award className="w-6 h-6 text-yellow-500" />
                                                    {semData.overview.rank}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Top {100 - semData.overview.percentile}% of students
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Credits Earned</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-3xl font-bold text-white">{semData.overview.credits}</div>
                                                <Progress value={100} className="h-1 mt-2 bg-green-900/20" indicatorClassName="bg-green-500" />
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-lg font-semibold text-white truncate" title={semData.overview.bestCourse}>
                                                    {semData.overview.bestCourse}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <Target className="w-3 h-3" /> Highest Score
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* 2. LIVE TREND VISUALIZATION */}
                                        <Card className="lg:col-span-2 bg-black/40 border-white/10">
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle>Semester Progress Trend</CardTitle>
                                                        <CardDescription>Comparative performance across all assessments this semester</CardDescription>
                                                    </div>
                                                    <Badge variant="outline" className="animate-pulse border-primary text-primary">Live Updates</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="h-[350px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={comparisonChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                        <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} />
                                                        <YAxis domain={[0, 100]} stroke="#888" tickLine={false} axisLine={false} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "8px" }}
                                                            itemStyle={{ fontSize: "12px" }}
                                                        />
                                                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                                        {semData.courses.map((course, idx) => (
                                                            <Line
                                                                key={course.id}
                                                                type="monotone"
                                                                dataKey={course.name}
                                                                stroke={COURSE_COLORS[idx % COURSE_COLORS.length]}
                                                                strokeWidth={3}
                                                                dot={{ r: 4, fill: "#000", strokeWidth: 2 }}
                                                                activeDot={{ r: 6 }}
                                                            />
                                                        ))}
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        {/* 3. INSIGHTS & FEEDBACK (Right Column) */}
                                        <div className="space-y-6">
                                            {/* Grade Distribution */}
                                            <Card className="bg-black/40 border-white/10">
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Grade Distribution</CardTitle>
                                                </CardHeader>
                                                <CardContent className="h-[200px] relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={semData.gradeDist}
                                                                innerRadius={50}
                                                                outerRadius={70}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                            >
                                                                {semData.gradeDist.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "none" }} />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="text-center">
                                                            <span className="text-2xl font-bold">{semData.courses.length}</span>
                                                            <p className="text-xs text-muted-foreground">Courses</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* AI Insights Card */}
                                            <Card className="bg-gradient-to-br from-purple-900/10 to-black/40 border-purple-500/20">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="flex items-center gap-2 text-sm text-purple-400">
                                                        <Zap className="w-4 h-4" /> AI Performance Insights
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {semData.insights.feedback.map((feed, idx) => (
                                                        <div key={idx} className="flex gap-3 text-sm p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                            <div className="mt-1">
                                                                {idx === 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> :
                                                                    idx === 1 ? <TrendingDown className="w-3 h-3 text-red-400" /> :
                                                                        <Target className="w-3 h-3 text-blue-400" />}
                                                            </div>
                                                            <p className="text-muted-foreground">{feed}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>

                                    {/* 4. MARKS BREAKDOWN GRID */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold">Course-wise Breakdown</h2>
                                            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1">
                                                View Full Report <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                            {semData.courses.map((course) => (
                                                <CourseMarkCard key={course.id} course={course} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* 5. MONTHLY PERFORMANCE INTENSITY (Heatmap-style Grid) */}
                                    <Card className="bg-black/40 border-white/10">
                                        <CardHeader>
                                            <CardTitle>Academic Intensity Heatmap</CardTitle>
                                            <CardDescription>Activity based on assessment frequency and performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((month, idx) => {
                                                    // Simulated intensity calculation
                                                    const intensity = idx === 3 ? "high" : idx === 4 ? "medium" : "low";
                                                    const colorClass =
                                                        intensity === "high" ? "bg-primary/80 text-white shadow-lg shadow-primary/20 scale-105" :
                                                            intensity === "medium" ? "bg-primary/40 text-white/80" :
                                                                "bg-muted/20 text-muted-foreground";

                                                    return (
                                                        <div key={month} className={cn("flex-1 min-w-[80px] h-20 rounded-lg flex flex-col items-center justify-center transition-all duration-300", colorClass)}>
                                                            <span className="text-sm font-bold">{month}</span>
                                                            <span className="text-[10px] mt-1 uppercase opacity-70">
                                                                {intensity === "high" ? "Peak" : intensity === "medium" ? "Active" : "Steady"}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>

                        {/* --- LMS PERFORMANCE VIEW --- */}
                        <TabsContent value="lms" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* 1. LMS OVERVIEW CARDS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-3xl font-bold text-white flex justify-center items-center gap-2">
                                            {LMS_PERFORMANCE_DATA.overview.completion}%
                                        </div>
                                        <Progress value={LMS_PERFORMANCE_DATA.overview.completion} className="h-1 mt-3" indicatorClassName="bg-blue-500" />
                                    </CardContent>
                                </Card>

                                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Assessments</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-3xl font-bold text-white">{LMS_PERFORMANCE_DATA.overview.assessments}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Attempted</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Time Spent</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-3xl font-bold text-white">{LMS_PERFORMANCE_DATA.overview.hoursLogged}h</div>
                                        <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Attendance</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-3xl font-bold text-emerald-400">{LMS_PERFORMANCE_DATA.overview.attendance}%</div>
                                        <p className="text-xs text-muted-foreground mt-1">LMS Participation</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-orange-900/20 to-black/40 border-orange-500/20 backdrop-blur-md">
                                    <CardHeader className="pb-2 text-center">
                                        <CardTitle className="text-sm font-medium text-orange-400 flex justify-center items-center gap-2">
                                            <Flame className="w-4 h-4" /> Streak
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="text-3xl font-bold text-white">{LMS_PERFORMANCE_DATA.overview.streak}</div>
                                        <p className="text-xs text-orange-300 mt-1">Days Active</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* LMS Charts Row */}
                                <Card className="lg:col-span-2 bg-black/40 border-white/10">
                                    <CardHeader>
                                        <CardTitle>Time Usage Analysis</CardTitle>
                                        <CardDescription>Daily activity on the platform for the past week</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={LMS_PERFORMANCE_DATA.timeUsage}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                                <XAxis dataKey="date" stroke="#888" tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888" tickLine={false} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: "#1e1e1e", border: "1px solid #333", borderRadius: "8px" }}
                                                    cursor={{ fill: "white", opacity: 0.1 }}
                                                />
                                                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="bg-black/40 border-white/10">
                                    <CardHeader>
                                        <CardTitle>Content Distribution</CardTitle>
                                        <CardDescription>Engagement by resource type</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={LMS_PERFORMANCE_DATA.contentCategories}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {LMS_PERFORMANCE_DATA.contentCategories.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: "#1e1e1e", borderRadius: "8px", border: "none" }} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* LMS BREAKDOWN TABS */}
                            <Tabs defaultValue="courses" className="w-full">
                                <TabsList className="w-full justify-start bg-transparent border-b border-white/10 rounded-none h-auto p-0 mb-6">
                                    <TabsTrigger value="courses" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Courses</TabsTrigger>
                                    <TabsTrigger value="assessments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Assessments</TabsTrigger>
                                    <TabsTrigger value="modules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent pb-3">Modules</TabsTrigger>
                                </TabsList>

                                <TabsContent value="courses" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {LMS_PERFORMANCE_DATA.courses.map(course => (
                                        <Card key={course.id} className="bg-black/40 border-white/10 hover:border-primary/50 transition-colors">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-semibold">{course.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Activity className="w-3 h-3" /> Last active: {course.lastActive}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col items-end gap-1">
                                                    <div className="text-sm font-bold text-primary">{course.completion}%</div>
                                                    <Button size="sm" variant="ghost" className="h-7 text-xs">Continue</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </TabsContent>

                                <TabsContent value="assessments" className="space-y-2">
                                    {LMS_PERFORMANCE_DATA.assessments.map(a => (
                                        <div key={a.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center",
                                                    a.status === "Pass" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500")}>
                                                    {a.status === "Pass" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{a.name}</div>
                                                    <div className="text-xs text-muted-foreground">Attempts: {a.attempts}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">{a.score}%</div>
                                                <Badge variant={a.status === "Pass" ? "default" : "destructive"} className="h-5 text-[10px]">{a.status}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="modules" className="space-y-4">
                                    {LMS_PERFORMANCE_DATA.modules.map((mod, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{mod.name}</span>
                                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                                                    mod.status === "Completed" ? "bg-green-500/20 text-green-400" :
                                                        mod.status === "In Progress" ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400")}>
                                                    {mod.status}
                                                </span>
                                            </div>
                                            <Progress value={mod.completion} className="h-2"
                                                indicatorClassName={mod.status === "Completed" ? "bg-green-500" : "bg-blue-500"}
                                            />
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default StudentPerformance;
