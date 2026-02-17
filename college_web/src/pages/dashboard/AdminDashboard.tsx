import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Building2,
  TrendingUp,
  ArrowRight,
  UserPlus,
  GraduationCap,
  Settings,
  Shield
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

import { useLMS } from "@/context/LMSContext";

const AdminDashboard = () => {
  const { students, teachers, deptAllocations, courses } = useLMS();

  const userGrowthData = [
    { name: "Jan", students: 2400, teachers: 120 },
    { name: "Feb", students: 2800, teachers: 135 },
    { name: "Mar", students: 3200, teachers: 148 },
    { name: "Apr", students: 3600, teachers: 160 },
    { name: "May", students: 4100, teachers: 175 },
    { name: "Jun", students: 4800, teachers: 186 },
  ];

  const departmentData = [
    { name: "Computer Science", students: 450, courses: 24 },
    { name: "Electrical", students: 380, courses: 20 },
    { name: "Mechanical", students: 420, courses: 22 },
    { name: "Civil", students: 350, courses: 18 },
    { name: "Chemical", students: 280, courses: 15 },
  ];

  const recentActivity = [
    { action: "New teacher registered", user: "Dr. Emily Brown", time: "5 mins ago", type: "user" },
    { action: "Course created", user: "Prof. Michael Chen", time: "15 mins ago", type: "course" },
    { action: "Department updated", user: "Admin", time: "1 hour ago", type: "department" },
    { action: "User role changed", user: "John Smith → Teacher", time: "2 hours ago", type: "role" },
    { action: "New semester started", user: "System", time: "1 day ago", type: "system" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'department': return <Building2 className="h-4 w-4" />;
      case 'role': return <Shield className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-primary/20 text-primary';
      case 'course': return 'bg-secondary/20 text-secondary';
      case 'department': return 'bg-accent/20 text-accent';
      case 'role': return 'bg-warning/20 text-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="admin" />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Platform overview and management
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="hero">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Students"
            value={students.length}
            subtitle="Active enrollments"
            icon={GraduationCap}
            trend={{ value: 12.5, isPositive: true }}
            color="primary"
          />
          <StatsCard
            title="Total Teachers"
            value={teachers.length}
            subtitle="Across all departments"
            icon={Users}
            trend={{ value: 8.2, isPositive: true }}
            color="secondary"
          />
          <StatsCard
            title="Departments"
            value={deptAllocations.length}
            subtitle="Active departments"
            icon={Building2}
            color="accent"
          />
          <StatsCard
            title="Active Courses"
            value={courses.length}
            subtitle="This semester"
            icon={BookOpen}
            trend={{ value: 15.3, isPositive: true }}
            color="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* User Growth Chart */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
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
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#colorStudents)"
                    />
                    <Area
                      type="monotone"
                      dataKey="teachers"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={3}
                      fill="url(#colorTeachers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-sm text-muted-foreground">Teachers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Overview */}
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              Department Overview
            </CardTitle>
            <Button variant="ghost" size="sm">
              Manage <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
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
                    dataKey="students"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
