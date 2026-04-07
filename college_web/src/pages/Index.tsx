
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GraduationCap, School, UserCog, Users, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="text-center mb-16 relative z-10 space-y-4">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Centralized Education Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
          Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Pulse</span>
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Seamlessly connecting Administrators, Colleges, Faculty, and Students in one unified ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full px-4 relative z-10">
        {/* Admin Card */}
        <Link to="/lms/admin/login">
          <Card className="group hover:border-purple-500/50 hover:bg-neutral-900/60 transition-all duration-300 cursor-pointer h-full bg-neutral-900/40 backdrop-blur-sm border-white/5 border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <UserCog className="w-8 h-8 text-purple-400" />
                </div>
                Admin
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">System Control Center</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500 group-hover:text-neutral-300 transition-colors">Manage colleges, course catalog, and global system settings.</p>
              <div className="mt-4 flex items-center text-purple-400 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Access Portal <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>



        {/* Teacher Card */}
        <Link to="/lms/teacher/login">
          <Card className="group hover:border-amber-500/50 hover:bg-neutral-900/60 transition-all duration-300 cursor-pointer h-full bg-neutral-900/40 backdrop-blur-sm border-white/5 border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="p-3 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                  <Users className="w-8 h-8 text-amber-400" />
                </div>
                Teacher
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">Faculty Dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500 group-hover:text-neutral-300 transition-colors">Manage classes, grade assignments, and track student progress.</p>
              <div className="mt-4 flex items-center text-amber-400 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Access Portal <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Student Card */}
        <Link to="/login">
          <Card className="group hover:border-emerald-500/50 hover:bg-neutral-900/60 transition-all duration-300 cursor-pointer h-full bg-neutral-900/40 backdrop-blur-sm border-white/5 border overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                  <GraduationCap className="w-8 h-8 text-emerald-400" />
                </div>
                Student
              </CardTitle>
              <CardDescription className="text-neutral-400 text-base">Learning Space</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-500 group-hover:text-neutral-300 transition-colors">Access courses, view internal marks, and track performance.</p>
              <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                Access Portal <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-16 text-center text-sm text-neutral-500 relative z-10">
        <p>Need assistance? <Link to="#" className="text-cyan-500 hover:text-cyan-400 transition-colors">Contact Support</Link></p>
      </div>
    </div>
  );
};

export default Index;
