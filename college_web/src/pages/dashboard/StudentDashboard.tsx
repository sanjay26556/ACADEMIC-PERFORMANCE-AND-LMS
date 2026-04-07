import Sidebar from "@/components/dashboard/Sidebar";
import StudentHomeView from "@/modules/student/components/StudentHomeView";

const StudentDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="student" />
      <main className="ml-64 p-8">
        <StudentHomeView />
      </main>
    </div>
  );
};

export default StudentDashboard;
