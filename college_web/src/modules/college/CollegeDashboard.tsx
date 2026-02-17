
import { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building, BookOpen, Layers, Users, GraduationCap, ArrowUpRight, Search, Filter, ClipboardList, Calendar, BarChart3, FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, MoreHorizontal, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/dashboard/Sidebar";
import { useSearchParams } from "react-router-dom";

export default function CollegeDashboard() {
    const { courses, deptAllocations, updateDeptAllocation } = useLMS();
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "dashboard";
    const [searchTerm, setSearchTerm] = useState("");

    // Common departments for demo
    const departments = ["Computer Science", "Information Technology", "Electronics", "Mechanical"];

    const handleAllocate = (courseId: string) => {
        if (!selectedDept) {
            toast.error("Please select a department first");
            return;
        }
        updateDeptAllocation(selectedDept, courseId, 'add');
        toast.success(`Course allocated to ${selectedDept}`);
    };

    const isAllocated = (courseId: string, deptName: string) => {
        const dept = deptAllocations.find(d => d.departmentName === deptName);
        return dept?.courseIds.includes(courseId);
    };

    // Derived State for KPIs
    const totalAllocations = deptAllocations.reduce((acc, curr) => acc + curr.courseIds.length, 0);
    const totalDepartments = deptAllocations.length;
    // Mock faculty count for demo
    const totalFaculty = 42;

    const DashboardOverview = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards (Floating) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Departments", value: totalDepartments, icon: Layers, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "Total Courses Allocated", value: totalAllocations, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                    { label: "Total Faculty", value: totalFaculty, icon: GraduationCap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                ].map((stat, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-[20px] ${stat.bg} ${stat.border} border p-6 shadow-2xl backdrop-blur-md group hover:-translate-y-1 transition-all duration-300 ease-in-out`}>
                        <div className="flex justify-between items-start z-10 relative">
                            <div>
                                <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</h3>
                                <div className={`text-4xl font-black mt-2 ${stat.color} tracking-tight`}>{stat.value}</div>
                            </div>
                            <div className={`p-3 rounded-xl bg-neutral-900/40 ${stat.color} shadow-inner`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        {/* Ambient Glow */}
                        <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Middle: Allocation Overview (Floating Glass Card) */}
            <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-shadow duration-500">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building className="w-5 h-5 text-cyan-400" />
                            Department Allocation Status
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">Overview of course distribution across departments.</p>
                    </div>
                    <Button variant="outline" className="border-white/10 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
                        View Details <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {deptAllocations.length > 0 ? deptAllocations.map(dept => (
                        <div key={dept.departmentName} className="p-5 rounded-xl bg-neutral-950/50 border border-white/5 hover:border-cyan-500/30 transition-all group flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="font-semibold text-neutral-200 group-hover:text-cyan-400 transition-colors">{dept.departmentName}</div>
                                <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">Active</Badge>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{dept.courseIds.length}</div>
                                <div className="text-xs text-neutral-500 font-medium">Courses Allocated</div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-8 text-neutral-500 italic">No allocations yet.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const CourseCatalog = () => (
        <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Course Catalog & Allocation
                    </h2>
                    <p className="text-sm text-neutral-400 mt-1">Select a department and allocate courses from the master list.</p>
                </div>

                <div className="flex items-center gap-4 bg-neutral-950/50 p-2 rounded-xl border border-white/5">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                        <Input
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-64 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-neutral-600 h-9"
                        />
                    </div>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Target:</span>
                        <Select value={selectedDept} onValueChange={setSelectedDept}>
                            <SelectTrigger className="w-[180px] h-9 bg-neutral-800 border-neutral-700 text-white focus:ring-purple-500/50">
                                <SelectValue placeholder="Select Dept" />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-xl overflow-visible">
                <Table className="border-separate border-spacing-y-3 -mt-3">
                    <TableHeader className="bg-transparent">
                        <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="text-neutral-500 font-medium px-4 tracking-wider text-xs uppercase">Code</TableHead>
                            <TableHead className="text-neutral-500 font-medium px-4 tracking-wider text-xs uppercase">Course Name</TableHead>
                            <TableHead className="text-neutral-500 font-medium px-4 tracking-wider text-xs uppercase">Subject</TableHead>
                            <TableHead className="text-neutral-500 font-medium px-4 tracking-wider text-xs uppercase">Status</TableHead>
                            <TableHead className="text-right text-neutral-500 font-medium px-4 tracking-wider text-xs uppercase">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-12 text-neutral-500">No courses available from Admin.</TableCell></TableRow>
                        ) : (
                            courses
                                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(course => {
                                    const allocated = selectedDept ? isAllocated(course.id, selectedDept) : false;
                                    return (
                                        <TableRow
                                            key={course.id}
                                            className="bg-neutral-900/40 backdrop-blur-sm border-0 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group"
                                        >
                                            <TableCell className="font-mono text-neutral-300 group-hover:text-purple-300 transition-colors rounded-l-2xl border-y border-l border-white/5 py-4">{course.code}</TableCell>
                                            <TableCell className="font-medium text-white border-y border-white/5 py-4">{course.name}</TableCell>
                                            <TableCell className="text-neutral-400 border-y border-white/5 py-4">{course.subject}</TableCell>
                                            <TableCell className="border-y border-white/5 py-4">
                                                {selectedDept ? (
                                                    allocated ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Allocated</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-neutral-500 border-neutral-800 bg-neutral-950/30">Available</Badge>
                                                    )
                                                ) : (
                                                    <span className="text-neutral-600 italic text-xs">Select target dept</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right rounded-r-2xl border-y border-r border-white/5 py-4">
                                                <Button
                                                    size="sm"
                                                    disabled={!selectedDept || allocated}
                                                    onClick={() => handleAllocate(course.id)}
                                                    className={`transition-all duration-300 rounded-lg ${allocated ? 'bg-transparent text-neutral-600 cursor-not-allowed hover:bg-transparent' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-500/30 hover:-translate-y-0.5'}`}
                                                >
                                                    {allocated ? "Assigned" : "allocate"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>

            </div>
        </div>
    );

    const DepartmentOverview = () => {
        // Hardcoded Data per request
        const departmentsData = [
            { id: "dept-1", name: "Computer Science", head: "Dr. Alan Turing", courses: 14, students: 420, faculty: 18, status: "Active" },
            { id: "dept-2", name: "Mechanical Engineering", head: "Prof. Nikola Tesla", courses: 10, students: 315, faculty: 14, status: "Active" },
            { id: "dept-3", name: "Electronics & Comm.", head: "Dr. H. Hertz", courses: 12, students: 280, faculty: 12, status: "Active" },
            { id: "dept-4", name: "Civil Engineering", head: "Prof. Isambard K. Brunel", courses: 8, students: 190, faculty: 9, status: "Maintenance" },
        ];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-blue-600/10 to-blue-900/10 border border-blue-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-blue-200/60 uppercase tracking-widest">Departments</h3>
                                <Layers className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-blue-100 mt-2">04</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-purple-200/60 uppercase tracking-widest">Total Students</h3>
                                <Users className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-purple-100 mt-2">1,205</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-amber-600/10 to-amber-900/10 border border-amber-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-amber-200/60 uppercase tracking-widest">Faculty</h3>
                                <GraduationCap className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-amber-100 mt-2">53</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full group-hover:bg-amber-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-emerald-600/10 to-emerald-900/10 border border-emerald-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-emerald-200/60 uppercase tracking-widest">Avg Performance</h3>
                                <Filter className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-emerald-100 mt-2">A+</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/30 transition-colors" />
                    </div>
                </div>

                {/* Departments List */}
                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Academic Departments</h2>
                            <p className="text-sm text-neutral-400">Overview of all operational departments.</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95">
                            Add Department
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {departmentsData.map((dept) => (
                            <div key={dept.id} className="group relative p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-blue-500/30 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                                <div className="flex items-center gap-4 z-10">
                                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                        <Layers className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-200 transition-colors">{dept.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                                            <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> HOD: {dept.head}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 md:gap-12 z-10 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Courses</div>
                                        <div className="text-lg font-bold text-white">{dept.courses}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Students</div>
                                        <div className="text-lg font-bold text-white">{dept.students}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Status</div>
                                        <Badge className={`mt-1 ${dept.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                            {dept.status}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const FacultyOverview = () => {
        // Hardcoded Faculty Data
        const facultyData = [
            { id: 1, name: "Dr. Eleanor Vance", role: "Professor", dept: "Computer Science", exp: "12 Yrs", rating: "4.9", status: "Active" },
            { id: 2, name: "Prof. Arthur C. Clarke", role: "Senior Lecturer", dept: "Physics", exp: "8 Yrs", rating: "4.7", status: "Active" },
            { id: 3, name: "Dr. Rosalind Franklin", role: "Assoc. Professor", dept: "Bio-Technology", exp: "15 Yrs", rating: "5.0", status: "On Leave" },
            { id: 4, name: "Mr. Ted Mosby", role: "Assistant Professor", dept: "Architecture", exp: "5 Yrs", rating: "4.5", status: "Active" },
            { id: 5, name: "Ms. Grace Hopper", role: "Guest Lecturer", dept: "Computer Science", exp: "20 Yrs", rating: "5.0", status: "Active" },
        ];

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Faculty Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-amber-600/10 to-amber-900/10 border border-amber-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-amber-200/60 uppercase tracking-widest">Total Faculty</h3>
                                <GraduationCap className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-amber-100 mt-2">53</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/20 blur-2xl rounded-full group-hover:bg-amber-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-cyan-600/10 to-cyan-900/10 border border-cyan-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-cyan-200/60 uppercase tracking-widest">Research Papers</h3>
                                <BookOpen className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-cyan-100 mt-2">128</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-purple-600/10 to-purple-900/10 border border-purple-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-purple-200/60 uppercase tracking-widest">Avg Experience</h3>
                                <Filter className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-purple-100 mt-2">8.5 Yrs</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/20 blur-2xl rounded-full group-hover:bg-purple-500/30 transition-colors" />
                    </div>
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-pink-600/10 to-pink-900/10 border border-pink-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-pink-200/60 uppercase tracking-widest">Avg Rating</h3>
                                <Users className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-3xl font-black text-pink-100 mt-2">4.8/5</div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-pink-500/20 blur-2xl rounded-full group-hover:bg-pink-500/30 transition-colors" />
                    </div>
                </div>

                {/* Faculty List */}
                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white">Faculty Directory</h2>
                            <p className="text-sm text-neutral-400">Manage current teaching staff and assignments.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="border-white/10 text-neutral-300 hover:bg-neutral-800 hover:text-white">Export List</Button>
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-900/20 transition-all hover:scale-105 active:scale-95">
                                Add Faculty
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {facultyData.map((staff) => (
                            <div key={staff.id} className="group relative p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-amber-500/30 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />

                                <div className="flex items-center gap-4 z-10 w-full md:w-auto">
                                    <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400 font-bold text-lg">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors">{staff.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                                            <span>{staff.role}</span>
                                            <span className="w-1 h-1 rounded-full bg-neutral-600" />
                                            <span>{staff.dept}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 md:gap-12 z-10 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Experience</div>
                                        <div className="text-base font-semibold text-neutral-200">{staff.exp}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">Rating</div>
                                        <div className="text-base font-semibold text-amber-400 flex items-center gap-1">
                                            <span className="text-xs">★</span> {staff.rating}
                                        </div>
                                    </div>
                                    <div className="min-w-[80px] text-right">
                                        <Badge className={` ${staff.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                            {staff.status}
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="icon" className="hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg">
                                        <ArrowUpRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const StudentRegistry = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Students", value: "2,405", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                    { label: "New Enrolments", value: "348", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                    { label: "Avg Attendance", value: "88%", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                    { label: "At Risk", value: "12", icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                ].map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-[20px] bg-gradient-to-br ${stat.bg.replace('10', '5')} to-${stat.bg.split('-')[1]}-900/10 border ${stat.border} shadow-xl backdrop-blur-sm relative overflow-hidden group`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-medium ${stat.color} opacity-70 uppercase tracking-widest`}>{stat.label}</h3>
                                <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                            </div>
                            <div className={`text-3xl font-black text-white mt-2`}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Student Directory</h2>
                    <Button variant="outline" className="border-white/10 text-neutral-300 hover:bg-neutral-800">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
                <div className="grid gap-4">
                    {[
                        { name: "Alice Johnson", id: "ST-2023-001", branch: "Computer Science", year: "3rd Year", status: "Active" },
                        { name: "Bob Smith", id: "ST-2023-042", branch: "Mechanical", year: "2nd Year", status: "Active" },
                        { name: "Charlie Brown", id: "ST-2023-105", branch: "Electronics", year: "Final Year", status: "Academic Probation" },
                        { name: "Diana Prince", id: "ST-2023-088", branch: "Civil", year: "1st Year", status: "Active" },
                    ].map((student, i) => (
                        <div key={i} className="group flex items-center justify-between p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">{student.name[0]}</div>
                                <div>
                                    <h4 className="font-bold text-white">{student.name}</h4>
                                    <p className="text-xs text-neutral-400">{student.id} • {student.branch}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8">
                                <span className="text-sm text-neutral-300">{student.year}</span>
                                <Badge variant="outline" className={student.status === 'Active' ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20'}>{student.status}</Badge>
                                <Button size="icon" variant="ghost" className="bg-transparent hover:bg-white/10 text-neutral-400"><MoreHorizontal className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const ExamController = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Upcoming Exams", value: "08", icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    { label: "Pending Results", value: "03", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                    { label: "Avg Score (Last Sem)", value: "76%", icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                ].map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-[20px] bg-gradient-to-br ${stat.bg.replace('10', '5')} to-${stat.bg.split('-')[1]}-900/10 border ${stat.border} shadow-xl backdrop-blur-sm relative overflow-hidden group`}>
                        <h3 className={`text-sm font-medium ${stat.color} opacity-70 uppercase tracking-widest`}>{stat.label}</h3>
                        <div className={`text-4xl font-black text-white mt-2`}>{stat.value}</div>
                        <stat.icon className={`absolute bottom-4 right-4 h-12 w-12 ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    </div>
                ))}
            </div>

            <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Examination Schedule</h2>
                <div className="grid gap-3">
                    {[
                        { title: "Advanced Data Structures", code: "CS-402", date: "Oct 24, 2026", time: "10:00 AM", hall: "Hall A1", status: "Scheduled" },
                        { title: "Thermodynamics II", code: "ME-305", date: "Oct 26, 2026", time: "02:00 PM", hall: "Hall B3", status: "Scheduled" },
                        { title: "Digital Circuits", code: "EC-201", date: "Oct 28, 2026", time: "10:00 AM", hall: "Hall C2", status: "Draft" },
                    ].map((exam, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl bg-neutral-950/40 border border-white/5 hover:border-amber-500/30 transition-all hover:bg-neutral-900/60">
                            <div>
                                <h4 className="font-bold text-white text-lg">{exam.title}</h4>
                                <div className="flex gap-3 text-sm text-neutral-400 mt-1">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-xs font-mono">{exam.code}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {exam.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4 md:mt-0">
                                <div className="flex items-center gap-2 text-neutral-300 text-sm"><Building className="w-4 h-4 text-neutral-500" /> {exam.hall}</div>
                                <Badge className={exam.status === 'Scheduled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-700/50 text-neutral-400'}>{exam.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const AttendanceTracker = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Daily Attendance</h2>
                        <div className="text-sm text-neutral-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Updating</div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { dept: "Computer Science", present: 92, total: 420 },
                            { dept: "Mechanical", present: 85, total: 315 },
                            { dept: "Electronics", present: 88, total: 280 },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-medium">{item.dept}</span>
                                    <span className="text-neutral-400">{item.present}% Present</span>
                                </div>
                                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${item.present}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Absentees</h2>
                    <div className="grid gap-2">
                        {["John Doe (CS)", "Jane Smith (Mech)", "Mike Ross (Civil)"].map((name, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800/50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">AB</div>
                                <span className="text-neutral-300">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-center items-center text-center">
                <div className="w-48 h-48 rounded-full border-8 border-neutral-800 flex items-center justify-center relative mb-6">
                    <div className="absolute inset-0 border-8 border-cyan-500 rounded-full border-t-transparent rotation-animation" />
                    <div className="text-5xl font-black text-white">89%</div>
                </div>
                <h3 className="text-lg font-bold text-white">Overall Attendance</h3>
                <p className="text-neutral-400 text-sm mt-2">Institution-wide average for Today.</p>
                <Button className="mt-8 w-full bg-neutral-800 hover:bg-neutral-700">View Detailed Report</Button>
            </div>
        </div>
    );

    const AnalyticsDashboard = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px] border-b-4 border-b-purple-500">
                    <BarChart3 className="w-16 h-16 text-purple-500 mb-6 opacity-80" />
                    <h3 className="text-2xl font-bold text-white">Academic Performance</h3>
                    <p className="text-neutral-400 text-center max-w-sm mt-2">Comprehensive breakdown of student grades across all semesters and departments.</p>
                    <Button variant="link" className="text-purple-400 mt-4">View Performance Metrics &rarr;</Button>
                </div>
                <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px] border-b-4 border-b-blue-500">
                    <TrendingUp className="w-16 h-16 text-blue-500 mb-6 opacity-80" />
                    <h3 className="text-2xl font-bold text-white">Course Engagement</h3>
                    <p className="text-neutral-400 text-center max-w-sm mt-2">Analysis of LMS usage, material access, and assignment submission rates.</p>
                    <Button variant="link" className="text-blue-400 mt-4">Explore Engagement Data &rarr;</Button>
                </div>
            </div>
        </div>
    );

    const RequestPortal = () => (
        <div className="rounded-[20px] bg-neutral-900/40 border border-white/5 backdrop-blur-md shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white">Service Requests</h2>
                    <p className="text-sm text-neutral-400">Manage administrative requests from faculty and students.</p>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white"><ArrowUpRight className="w-4 h-4 mr-2" /> New Request</Button>
            </div>

            <div className="space-y-3">
                {[
                    { id: "REQ-992", type: "Equipment Requisition", from: "Dr. Alan Turing", date: "2 mins ago", status: "Pending" },
                    { id: "REQ-991", type: "Leave Application", from: "Jane Doe (Student)", date: "1 hour ago", status: "Approved" },
                    { id: "REQ-988", type: "Course Enrollment Issue", from: "Bob Smith", date: "Yesterday", status: "Resolved" },
                ].map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-neutral-950/40 border border-white/5 hover:bg-neutral-900/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${req.status === 'Pending' ? 'bg-amber-500' : req.status === 'Approved' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                            <div>
                                <h4 className="font-bold text-neutral-200">{req.type}</h4>
                                <p className="text-xs text-neutral-500">{req.id} • from {req.from}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-neutral-500">{req.date}</span>
                            <Badge variant="outline" className={`min-w-[80px] justify-center ${req.status === 'Pending' ? 'text-amber-400 border-amber-500/20' : req.status === 'Approved' ? 'text-blue-400 border-blue-500/20' : 'text-emerald-400 border-emerald-500/20'}`}>{req.status}</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardOverview />;
            case 'courses': return <CourseCatalog />;
            case 'departments': return <DepartmentOverview />;
            case 'faculty': return <FacultyOverview />;
            case 'students': return <StudentRegistry />;
            case 'exams': return <ExamController />;
            case 'attendance': return <AttendanceTracker />;
            case 'reports': return <AnalyticsDashboard />;
            case 'requests': return <RequestPortal />;
            default: return <DashboardOverview />;
        }
    };

    return (
        <div className="flex min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-cyan-500/30">
            <Sidebar role="college" />

            <div className="flex-1 ml-64 p-8 lg:p-12 transition-all duration-300 ease-in-out relative">
                {/* Decorative background gradients */}
                <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col gap-1 mb-8">
                        <h1 className="text-3xl font-bold text-white tracking-tight capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-neutral-400">Manage your institution's academic operations.</p>
                    </div>

                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
