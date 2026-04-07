import { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Layers, Users, GraduationCap, ChevronLeft, Building2 } from "lucide-react";

const DEPARTMENTS = [
    "CSE (Computer Science & Engineering)",
    "ECE (Electronics & Communication Engineering)",
    "EEE (Electrical & Electronics Engineering)",
    "Mechanical Engineering",
    "Aeronautical Engineering",
    "Biomedical Engineering",
    "Architecture"
];

export function DepartmentManagement() {
    const { students, teachers } = useLMS();
    const [selectedDept, setSelectedDept] = useState<string | null>(null);

    const getStudentCount = (dept: string) => {
        return students.filter(s => s.department === dept).length;
    };

    const getStaffCount = (dept: string) => {
        return teachers.filter(t => t.department === dept).length;
    };

    if (selectedDept) {
        const deptStudents = students.filter(s => s.department === selectedDept);
        const deptStaff = teachers.filter(t => t.department === selectedDept);

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setSelectedDept(null)} className="hover:bg-neutral-800 text-neutral-300">
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Back to Departments
                    </Button>
                    <h2 className="text-2xl font-bold text-white tracking-wide">{selectedDept} Department</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Students Section */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <GraduationCap className="h-5 w-5 text-emerald-400" />
                                Students in {selectedDept} ({deptStudents.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-neutral-900/80">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-neutral-400">Register No</TableHead>
                                        <TableHead className="text-neutral-400">Name</TableHead>
                                        <TableHead className="text-neutral-400">Year / Section</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deptStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-neutral-500">No students found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        deptStudents.map(student => (
                                            <TableRow key={student.id} className="border-white/5 hover:bg-neutral-800/50">
                                                <TableCell className="text-neutral-300">{student.register_number}</TableCell>
                                                <TableCell className="font-medium text-white">{student.name}</TableCell>
                                                <TableCell className="text-neutral-400">TBA</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Staff Section */}
                    <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <Users className="h-5 w-5 text-blue-400" />
                                Staff in {selectedDept} ({deptStaff.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-neutral-900/80">
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-neutral-400">Staff ID</TableHead>
                                        <TableHead className="text-neutral-400">Name</TableHead>
                                        <TableHead className="text-neutral-400">Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deptStaff.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-neutral-500">No staff found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        deptStaff.map(staff => (
                                            <TableRow key={staff.id} className="border-white/5 hover:bg-neutral-800/50">
                                                <TableCell className="text-neutral-300">{staff.register_number}</TableCell>
                                                <TableCell className="font-medium text-white">{staff.name}</TableCell>
                                                <TableCell className="text-neutral-400">Teacher</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-lg shadow-blue-900/20 col-span-full md:col-span-1">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-200/60 uppercase text-xs">Total Departments</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-100">{DEPARTMENTS.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-blue-300">
                            <Building2 className="w-3 h-3" />
                            <span>Academic Divisions</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {DEPARTMENTS.map((dept) => {
                    const studentCount = getStudentCount(dept);
                    const staffCount = getStaffCount(dept);
                    return (
                        <Card
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className="bg-neutral-900/40 backdrop-blur-md border border-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer group shadow-xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Layers className="w-24 h-24 text-cyan-500 rotate-12" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                    {dept}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-between items-center text-sm text-neutral-400">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-emerald-400/70" />
                                    <span>{studentCount} Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-400/70" />
                                    <span>{staffCount} Staff</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
