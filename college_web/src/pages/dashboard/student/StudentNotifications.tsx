import Sidebar from "@/components/dashboard/Sidebar";
import StudentNotificationsView from "@/modules/student/components/StudentNotificationsView";

const StudentNotifications = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentNotificationsView />
            </main>
        </div>
    );
};

export default StudentNotifications;
