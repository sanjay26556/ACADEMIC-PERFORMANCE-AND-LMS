
import { BookOpen, Building2, GraduationCap, Users, BarChart3, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLMS } from "@/context/LMSContext";

export function DashboardOverview() {
    const { courses, colleges, teachers, students } = useLMS();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section for Dashboard Home */}
            <div className="flex justify-between items-end pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Admin Dashboard</h1>
                    <p className="text-neutral-400 font-medium">Centralized Control, Monitoring & Management</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-white">System Status</p>
                        <p className="text-xs text-green-400 flex items-center justify-end gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Operational
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* KPI Cards */}
                {[
                    { title: "Total Courses", value: courses?.length || 0, icon: BookOpen, color: "text-blue-400", sub: "+2 from last month" },
                    { title: "Faculty Members", value: teachers?.length || 0, icon: GraduationCap, color: "text-amber-400", sub: "Across all departments" },
                    { title: "Enrolled Students", value: students?.length || 0, icon: Users, color: "text-emerald-400", sub: "Actively learning" }
                ].map((item, idx) => (
                    <Card key={idx} className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-neutral-800/60 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/40 transition-all duration-300 group cursor-default rounded-2xl overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${item.color}`}>
                            <item.icon className="h-24 w-24 -mt-4 -mr-4 transform rotate-12" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">{item.title}</CardTitle>
                            <item.icon className={`h-5 w-5 ${item.color} drop-shadow-md`} />
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold text-white tracking-tight">{item.value}</div>
                            <p className="text-xs text-neutral-500 mt-1 font-medium group-hover:text-neutral-400 transition-colors">{item.sub}</p>
                        </CardContent>
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${item.color.split('-')[1]}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-neutral-900/40 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-white">System Activity</CardTitle>
                        <CardDescription className="text-neutral-400">Recent actions across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] flex items-center justify-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl bg-neutral-950/30">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto">
                                    <BarChart3 className="w-6 h-6 text-neutral-600" />
                                </div>
                                <p className="text-sm">Activity analytics visualization</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-neutral-900/40 backdrop-blur-md border border-white/5 shadow-xl shadow-black/20 rounded-2xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                        <CardDescription className="text-neutral-400">Common management tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Button variant="outline" className="w-full justify-start gap-4 h-14 border-neutral-800 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 bg-neutral-950/50 text-neutral-300 transition-all rounded-xl group relative overflow-hidden">
                            <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <Plus className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="font-medium">Add New Academy Year</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-4 h-14 border-neutral-800 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 bg-neutral-950/50 text-neutral-300 transition-all rounded-xl group relative overflow-hidden">
                            <div className="bg-purple-500/10 p-2 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                <Building2 className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="font-medium">Review College Applications</span>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-4 h-14 border-neutral-800 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 bg-neutral-950/50 text-neutral-300 transition-all rounded-xl group relative overflow-hidden">
                            <div className="bg-red-500/10 p-2 rounded-lg group-hover:bg-red-500/20 transition-colors">
                                <Trash2 className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="font-medium">Clean Up Archived Courses</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
