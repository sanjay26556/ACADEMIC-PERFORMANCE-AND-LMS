import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const TeacherDashboard = () => {
  const classPerformanceData = [
    { name: "DSA", avgScore: 78 },
    { name: "ML", avgScore: 82 },
    { name: "DBMS", avgScore: 85 },
    { name: "Networks", avgScore: 72 },
    { name: "OS", avgScore: 79 },
  ];

  const attendanceData = [
    { name: "Present", value: 85, color: "hsl(var(--success))" },
    { name: "Absent", value: 10, color: "hsl(var(--destructive))" },
    { name: "Late", value: 5, color: "hsl(var(--warning))" },
  ];

  const pendingGrading = [
    { title: "Algorithm Analysis Report", course: "DSA", submissions: 45, total: 48, deadline: "2 days" },
    { title: "ML Project Phase 2", course: "Machine Learning", submissions: 38, total: 40, deadline: "3 days" },
    { title: "SQL Assignment 5", course: "DBMS", submissions: 50, total: 52, deadline: "5 days" },
  ];

  const recentSubmissions = [
    { student: "Alice Johnson", assignment: "Binary Tree Implementation", time: "5 mins ago", status: "pending" },
    { student: "Bob Smith", assignment: "Neural Network Lab", time: "12 mins ago", status: "pending" },
    { student: "Carol Davis", assignment: "Database Design", time: "25 mins ago", status: "graded" },
    { student: "David Wilson", assignment: "Binary Tree Implementation", time: "1 hour ago", status: "graded" },
  ];

  const upcomingClasses = [
    { course: "Data Structures", time: "10:00 AM", room: "Room 301", students: 48 },
    { course: "Machine Learning", time: "2:00 PM", room: "Lab 205", students: 40 },
    { course: "Database Systems", time: "4:00 PM", room: "Room 102", students: 52 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="teacher" />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Good morning, <span className="gradient-text">Dr. Johnson!</span>
            </h1>
            <p className="text-muted-foreground">
              You have 3 classes scheduled for today.
            </p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value="186"
            subtitle="Across 5 courses"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            color="primary"
          />
          <StatsCard
            title="Active Courses"
            value="5"
            subtitle="This semester"
            icon={BookOpen}
            color="secondary"
          />
          <StatsCard
            title="Pending Grading"
            value="23"
            subtitle="Submissions awaiting"
            icon={FileText}
            color="warning"
          />
          <StatsCard
            title="Avg. Attendance"
            value="87%"
            subtitle="This month"
            icon={Calendar}
            trend={{ value: 2.5, isPositive: true }}
            color="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Class Performance Chart */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Class Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Bar
                      dataKey="avgScore"
                      fill="url(#colorScore)"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {attendanceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Grading */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-warning" />
                Pending Grading
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingGrading.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.course}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{item.submissions}/{item.total}</p>
                      <p className="text-xs text-muted-foreground">Submissions</p>
                    </div>
                    <div className="w-32">
                      <Progress
                        value={(item.submissions / item.total) * 100}
                        color="gradient"
                        className="h-2 mb-1"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        Due in {item.deadline}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Grade
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((classItem, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{classItem.course}</p>
                      <Badge variant="glass">{classItem.time}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{classItem.room}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {classItem.students} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card variant="glass" className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {submission.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{submission.student}</p>
                    <p className="text-sm text-muted-foreground truncate">{submission.assignment}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{submission.time}</span>
                    </div>
                    {submission.status === 'graded' ? (
                      <Badge variant="success" className="mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Graded
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeacherDashboard;
