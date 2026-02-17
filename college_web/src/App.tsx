import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import MyCourses from "./pages/dashboard/student/MyCourses";
import StudentAssignments from "./pages/dashboard/student/StudentAssignments";
import StudentAttendance from "./pages/dashboard/student/StudentAttendance";
import StudentPerformance from "./pages/dashboard/student/StudentPerformance";
import StudentAchievements from "./pages/dashboard/student/StudentAchievements";
import StudentNotifications from "./pages/dashboard/student/StudentNotifications";
import NotFound from "./pages/NotFound";

// LMS Imports
import { LMSProvider } from "./context/LMSContext";
import LMSAdminLogin from "./modules/admin/AdminLogin";
import LMSAdminDashboard from "./modules/admin/AdminDashboard";

import TeacherLogin from "./modules/teacher/TeacherLogin";
import TeacherDashboardLMS from "./modules/teacher/TeacherDashboard";
import StudentLogin from "./modules/student/StudentLogin";
import StudentDashboardLMS from "./modules/student/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <LMSProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Existing Dashboard Routes */}
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/student/courses" element={<MyCourses />} />
            <Route path="/dashboard/student/assignments" element={<StudentAssignments />} />
            <Route path="/dashboard/student/attendance" element={<StudentAttendance />} />
            <Route path="/dashboard/student/performance" element={<StudentPerformance />} />
            <Route path="/dashboard/student/achievements" element={<StudentAchievements />} />
            <Route path="/dashboard/student/notifications" element={<StudentNotifications />} />
            <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />

            {/* NEW LMS ROUTES */}
            <Route path="/lms/admin/login" element={<LMSAdminLogin />} />
            <Route path="/lms/admin/dashboard" element={<LMSAdminDashboard />} />



            <Route path="/lms/teacher/login" element={<TeacherLogin />} />
            <Route path="/lms/teacher/dashboard" element={<TeacherDashboardLMS />} />

            <Route path="/lms/student/login" element={<StudentLogin />} />
            <Route path="/lms/student/dashboard" element={<StudentDashboardLMS />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LMSProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
