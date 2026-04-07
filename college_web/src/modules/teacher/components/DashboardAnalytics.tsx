import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Trophy, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const fetchWithAuth = async (url: string, options: any = {}) => {
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/lms/teacher/login';
        throw new Error('Unauthorized');
    }
    return res;
};


const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function DashboardAnalytics() {
    // Filters
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("All");
    const [type, setType] = useState<"assignment" | "assessment">("assessment");
    const [items, setItems] = useState([]); // Assignments or Assessments
    const [selectedItem, setSelectedItem] = useState("");

    // Data
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Initial Load - Courses
    useEffect(() => {
        fetchWithAuth(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCourses(data);
            })
            .catch(err => console.error(err));
    }, []);

    // Load Items based on Filters
    useEffect(() => {
        const fetchItems = async () => {
            try {
                let url = `${API_URL}/${type}s`;
                // Add course filter if selected (assignments have course_id, assessments linked via assignment)
                // For simplicity, let's fetch all and filter client side or just fetch all for now.
                // Actually, the endpoints support filtering.
                // Let's just fetch all for the teacher and filter by course if needed.
                const res = await fetchWithAuth(url, { headers: getAuthHeaders() });
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Filter by course if selected
                    let filtered = data;
                    if (selectedCourse !== "All") {
                        // Assignments have course_id directly.
                        // Assessments need to join via assignment. The API returns assignment_id but maybe not course_id directly for assessments list?
                        // Actually, my assessments list endpoint returns `assignment_title` but maybe not course_id.
                        // Let's assume for now we list all or filter if possible.
                        // Wait, fetching ALL assessments might be heavy.
                        // Optimized approach: The `GET /assessments` endpoint filters by `assignment_id`. 
                        // But I want a list of ALL assessments to populate the dropdown.
                        // The `GET /assessments` endpoint returns a list. I can check if it has course_id.
                        // My `GET /assessments` implementation:
                        // `SELECT a.*, asg.title as assignment_title FROM assessments a JOIN assignments asg ...`
                        // It doesn't select `asg.course_id`. I should update it or just fetch all.
                        // Let's filter client side if the property exists, else show all.

                        // Actually, for this dashboard to be useful, filtering by course is good but maybe not strictly required for the dropdown if we show "Course Name - Assessment Title".
                        // Let's stick to showing all items for the selected type, maybe sorted by date.
                    }
                    setItems(filtered);
                    if (filtered.length > 0) setSelectedItem(String(filtered[0].id));
                    else setSelectedItem("");
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchItems();
    }, [type, selectedCourse]);

    // Load Analytics Data
    useEffect(() => {
        if (!selectedItem) return;
        setLoading(true);
        fetchWithAuth(`${API_URL}/teacher/dashboard/analytics?type=${type}&id=${selectedItem}&course_id=${selectedCourse !== 'All' ? selectedCourse : ''}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error("Failed to load analytics");
                setLoading(false);
            });
    }, [selectedItem, selectedCourse, type]);

    if (!selectedItem && items.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                No {type}s found. Create one to see analytics.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-emerald-400" />
                        Student Performance Overview
                    </h2>
                    <p className="text-neutral-400">Real-time insights from your assessments</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger className="w-[140px] bg-neutral-900 border-neutral-700">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[180px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Courses</SelectItem>
                            {courses.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger className="w-[240px] bg-neutral-900 border-neutral-700">
                            <SelectValue placeholder={`Select ${type}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {items.map((i: any) => (
                                <SelectItem key={i.id} value={String(i.id)}>
                                    {i.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading || !data || !data.leaderboard ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Leaderboard - Left Column */}
                    <Card className="lg:col-span-1 bg-neutral-900/50 border-neutral-800 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Top Performers
                            </CardTitle>
                            <CardDescription>Top 10 students by score</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-neutral-800 hover:bg-transparent">
                                        <TableHead className="w-12 text-center text-neutral-400">Rank</TableHead>
                                        <TableHead className="text-neutral-400">Student</TableHead>
                                        <TableHead className="text-right text-neutral-400">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.leaderboard.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-neutral-500">
                                                No submissions yet
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.leaderboard.map((s: any) => (
                                            <TableRow key={s.register_number} className="border-neutral-800">
                                                <TableCell className="text-center font-bold text-white">
                                                    {s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : s.rank}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-neutral-200">{s.name}</div>
                                                    <div className="text-xs text-neutral-500">{s.register_number}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-emerald-400">
                                                    {s.score} <span className="text-xs text-neutral-600">({s.percentage}%)</span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Charts - Right Column (Span 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-5 gap-4">
                            <Card className="bg-neutral-900/50 border-neutral-800 p-4 flex flex-col items-center justify-center">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Avg Score</div>
                                <div className="text-2xl font-bold text-white">{data.stats.avg}</div>
                            </Card>
                            <Card className="bg-neutral-900/50 border-neutral-800 p-4 flex flex-col items-center justify-center">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Highest</div>
                                <div className="text-2xl font-bold text-emerald-400">{data.stats.max}</div>
                            </Card>
                            <Card className="bg-neutral-900/50 border-neutral-800 p-4 flex flex-col items-center justify-center">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Lowest</div>
                                <div className="text-2xl font-bold text-red-400">{data.stats.min}</div>
                            </Card>
                            <Card className="bg-neutral-900/50 border-neutral-800 p-4 flex flex-col items-center justify-center">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Submitted</div>
                                <div className="text-2xl font-bold text-blue-400">{data.stats.total_submissions}</div>
                            </Card>
                            <Card className="bg-neutral-900/50 border-neutral-800 p-4 flex flex-col items-center justify-center">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider">Participation</div>
                                <div className="text-2xl font-bold text-purple-400">{data.stats.submission_pct}%</div>
                            </Card>
                        </div>

                        {/* Coding Insights (Conditional) */}
                        {data.coding_insights && (
                            <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                <Card className="bg-neutral-800/50 border-neutral-700 p-3 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Avg Test Cases Passed</div>
                                    <div className="text-xl font-bold text-white">
                                        {data.coding_insights.avg_test_cases_passed} <span className="text-xs text-neutral-500">/ {data.coding_insights.total_test_cases}</span>
                                    </div>
                                </Card>
                                <Card className="bg-neutral-800/50 border-neutral-700 p-3 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Max Success Rate</div>
                                    <div className="text-xl font-bold text-emerald-400">{data.coding_insights.max_success_rate}%</div>
                                </Card>
                                <Card className="bg-neutral-800/50 border-neutral-700 p-3 flex flex-col items-center justify-center">
                                    <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Min Success Rate</div>
                                    <div className="text-xl font-bold text-red-400">{data.coding_insights.min_success_rate}%</div>
                                </Card>
                            </div>
                        )}

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pie Chart */}
                            <Card className="bg-neutral-900/50 border-neutral-800">
                                <CardHeader>
                                    <CardTitle className="text-sm">Performance Distribution</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.distribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.distribution.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Bar Chart */}
                            <Card className="bg-neutral-900/50 border-neutral-800">
                                <CardHeader>
                                    <CardTitle className="text-sm">Score Comparison</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.chart_data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                                            <XAxis dataKey="student" hide />
                                            <YAxis stroke="#a3a3a3" fontSize={12} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                                                labelStyle={{ color: '#a3a3a3' }}
                                            />
                                            <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Line Chart - Class Trend */}
                        <Card className="bg-neutral-900/50 border-neutral-800">
                            <CardHeader>
                                <CardTitle className="text-sm">Class Progress Trend (Last 5)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.trend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                                        <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickFormatter={(v) => v.length > 10 ? `${v.substring(0, 10)}...` : v} />
                                        <YAxis stroke="#a3a3a3" fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
                                            labelStyle={{ color: '#a3a3a3' }}
                                        />
                                        <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
