import Sidebar from "@/components/dashboard/Sidebar";
import StudentAssessmentsView from "@/modules/student/components/StudentAssessmentsView";

const StudentAssessments = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentAssessmentsView />
            </main>
        </div>
    );
};

export default StudentAssessments;
