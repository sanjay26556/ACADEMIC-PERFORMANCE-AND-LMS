
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { StudentManagement } from "./components/StudentManagement";
import { TeacherManagement } from "./components/TeacherManagement";
import { DepartmentManagement } from "@/modules/admin/components/DepartmentManagement";
import { UserDirectory } from "./components/UserDirectory";
import { PlatformAnalytics } from "@/modules/admin/components/PlatformAnalytics";
import { CourseDirectory } from "@/modules/admin/components/CourseDirectory";
import { DashboardOverview } from "@/modules/admin/components/DashboardOverview";
import Sidebar from "@/components/dashboard/Sidebar";

export default function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync active view with URL query param 'tab'
    // Default to 'overview' if no tab is specified
    const activeTab = searchParams.get("tab") || "overview";

    // Render the specific component based on activeTab
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DashboardOverview />;
            case 'users':
                return <UserDirectory />;
            case 'analytics':
                return <PlatformAnalytics />;
            case 'courses':
                return <CourseDirectory />;
            case 'departments':
                return <DepartmentManagement />;
            case 'teachers':
                return <TeacherManagement />;
            case 'students':
                return <StudentManagement />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-cyan-500/30">
            <Sidebar role="admin" />

            <div className="flex-1 ml-64 p-8 lg:p-12 transition-all duration-300 ease-in-out">
                {renderContent()}
            </div>
        </div>
    );
}
