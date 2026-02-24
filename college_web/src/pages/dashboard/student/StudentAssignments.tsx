import Sidebar from "@/components/dashboard/Sidebar";
import StudentAssignmentsView from "@/modules/student/components/StudentAssignmentsView";

const StudentAssignments = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentAssignmentsView />
            </main>
        </div>
    );
};

export default StudentAssignments;
