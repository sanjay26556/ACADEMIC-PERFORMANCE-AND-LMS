import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Trophy, TrendingUp, Target, Activity } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function StudentPerformanceView() {
    const [marksList, setMarksList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('All');

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const marksRes = await fetch(`${API_URL}/student/marks`, { headers: getAuthHeaders() });
                if (marksRes.ok) {
                    const data = await marksRes.json();
                    setMarksList(data);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load performance data");
            } finally {
                setLoading(false);
            }
        };
        fetchPerformanceData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading performance data...</div>;

    // Filter by selected course
    const filteredMarks = selectedCourse === 'All' ? marksList : marksList.filter(m => m.subject_code === selectedCourse);

    // Prepare data for UI
    const courseWiseScores: any = {};
    const examWiseScores: any = {};
    const uniqueCourses = new Set<string>();

    filteredMarks.forEach(record => {
        uniqueCourses.add(record.subject_code);
        const percentage = Math.round((record.marks_obtained / record.max_marks) * 100);

        // Course Wise average
        if (!courseWiseScores[record.subject_name]) {
            courseWiseScores[record.subject_name] = { total: 0, count: 0 };
        }
        courseWiseScores[record.subject_name].total += percentage;
        courseWiseScores[record.subject_name].count += 1;

        // Exam Wise progression
        const examName = `${record.subject_code} - ${record.exam_type}`;
        if (!examWiseScores[examName]) {
            examWiseScores[examName] = 0;
        }
        examWiseScores[examName] = percentage;
    });

    const coursesList = Array.from(uniqueCourses);

    const barChartData = Object.keys(courseWiseScores).map(k => ({
        subject: k,
        average: Math.round(courseWiseScores[k].total / courseWiseScores[k].count)
    }));

    const lineChartData = Object.keys(examWiseScores).map(k => ({
        exam: k,
        score: examWiseScores[k]
    }));

    // Mock Rank distribution if needed
    const pieData = Object.keys(courseWiseScores).map(k => ({
        name: k.substring(0, 15) + '...',
        value: Math.round(courseWiseScores[k].total / courseWiseScores[k].count)
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-indigo-600 w-6 h-6" /> Academic Performance</h2>
                    <p className="text-gray-500 mt-1">Track your progress, ranks, and test scores</p>
                </div>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Courses</SelectItem>
                        {coursesList.map((c: string) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2 text-center">
                        <CardDescription>Overall Progress</CardDescription>
                        <CardTitle className="text-3xl text-blue-600">
                            {barChartData.length > 0 ? Math.round(barChartData.reduce((acc, curr) => acc + curr.average, 0) / barChartData.length) : 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center"><Activity className="w-8 h-8 text-blue-300" /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-center">
                        <CardDescription>Class Rank (Est.)</CardDescription>
                        <CardTitle className="text-3xl text-purple-600">Top 15%</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center"><TrendingUp className="w-8 h-8 text-purple-300" /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-center">
                        <CardDescription>Highest Score</CardDescription>
                        <CardTitle className="text-3xl text-green-600">
                            {lineChartData.length > 0 ? Math.max(...lineChartData.map(d => d.score)) : 0}%
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center"><Target className="w-8 h-8 text-green-300" /></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-center">
                        <CardDescription>Total Exams Logged</CardDescription>
                        <CardTitle className="text-3xl text-orange-600">{filteredMarks.length}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center"><Trophy className="w-8 h-8 text-orange-300" /></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Semester Progress Trend</CardTitle>
                        <CardDescription>Your marks progression across different exams.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {lineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineChartData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="exam" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} />
                                    <RechartsTooltip />
                                    <Area type="monotone" dataKey="score" stroke="#8884d8" fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">Not enough data available.</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle>Course-wise Performance Breakdown</CardTitle>
                        <CardDescription>Average score mapped for each subject.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {barChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="subject" type="category" tick={{ fontSize: 11 }} width={120} />
                                    <RechartsTooltip />
                                    <Bar dataKey="average" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                                        {barChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">Not enough data available.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
