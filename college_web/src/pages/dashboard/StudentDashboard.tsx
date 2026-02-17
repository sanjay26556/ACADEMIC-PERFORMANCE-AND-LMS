import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  TrendingUp,
  Calendar,
  AlertCircle
} from "lucide-react";
import { student } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MarksView from "@/modules/student/MarksView";

interface DashboardData {
  profile: {
    name: string;
    department: string;
    semester: number;
  };
  stats: {
    attendance: string | null;
    cgpa: string | null;
    sem_cgpa: string | null;
  };
  hasData: boolean;
}

const StudentDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await student.getDashboard();
        setData(response.data);
      } catch (error: any) {
        console.error("Failed to fetch dashboard data", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!data || !data.hasData) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar role="student" />
        <main className="ml-64 p-8 flex flex-col items-center justify-center h-[80vh]">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Data Available Yet</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to EduPulse! Your academic performance data will appear here once your faculty publishes it.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="student" />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{data.profile.name}!</span>
          </h1>
          <p className="text-muted-foreground">
            {data.profile.department} | Semester {data.profile.semester}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {data.stats.cgpa && (
            <StatsCard
              title="Current CGPA"
              value={data.stats.cgpa}
              subtitle="Out of 10.0"
              icon={TrendingUp}
              color="primary"
            />
          )}

          {data.stats.attendance && (
            <StatsCard
              title="Attendance"
              value={`${data.stats.attendance}%`}
              subtitle="This semester"
              icon={Calendar}
              color="success"
            />
          )}
        </div>

        {/* Marks View Section */}
        <MarksView />
      </main>
    </div>
  );
};

export default StudentDashboard;
