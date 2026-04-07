import Sidebar from "@/components/dashboard/Sidebar";
import StudentAchievementsView from "@/modules/student/components/StudentAchievementsView";

const StudentAchievements = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <StudentAchievementsView />
            </main>
        </div>
    );
};

export default StudentAchievements;
