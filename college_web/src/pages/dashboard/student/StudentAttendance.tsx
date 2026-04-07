import Sidebar from "@/components/dashboard/Sidebar";
import StudentAttendanceView from "@/modules/student/components/StudentAttendanceView";

const StudentAttendance = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentAttendanceView />
            </main>
        </div>
    );
};

export default StudentAttendance;
