import Sidebar from "@/components/dashboard/Sidebar";
import StudentPerformanceView from "@/modules/student/components/StudentPerformanceView";

const StudentPerformance = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentPerformanceView />
            </main>
        </div>
    );
};

export default StudentPerformance;
