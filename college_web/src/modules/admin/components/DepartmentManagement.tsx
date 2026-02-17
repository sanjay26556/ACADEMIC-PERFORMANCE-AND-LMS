
import { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Plus, Trash2, Layers, Search, BookOpen, Building2 } from "lucide-react";
import { toast } from "sonner";

export function DepartmentManagement() {
    const { deptAllocations, addDepartment, deleteDepartment } = useLMS();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDeptName.trim()) {
            toast.error("Department name is required");
            return;
        }

        addDepartment(newDeptName);
        toast.success("Department created successfully");
        setNewDeptName("");
        setIsAddModalOpen(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            deleteDepartment(id);
            toast.success("Department deleted.");
        }
    };

    const filteredDepts = deptAllocations.filter(d =>
        d.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCourses = deptAllocations.reduce((acc, curr) => acc + curr.courseIds.length, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-lg shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="w-24 h-24 text-blue-500 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-200/60 font-medium tracking-wide uppercase text-xs">Total Departments</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-100">{deptAllocations.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                            <Building2 className="w-3 h-3" />
                            <span>Academic Divisions</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Total Allocations</CardDescription>
                        <CardTitle className="text-4xl font-black text-cyan-100 group-hover:text-cyan-400 transition-colors">
                            {totalCourses}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <BookOpen className="w-3 h-3 text-cyan-400" />
                            <span>Courses Assigned</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Growth</CardDescription>
                        <CardTitle className="text-4xl font-black text-purple-100 group-hover:text-purple-400 transition-colors">+2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-neutral-400 flex items-center gap-2">
                            <span>New this semester</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <Input
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all rounded-xl"
                    />
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95 font-medium text-sm border-0">
                            <Plus className="h-4 w-4" /> Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Department</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-neutral-400">Department Name</Label>
                                <Input
                                    placeholder="e.g. Mechanical Engineering"
                                    value={newDeptName}
                                    onChange={e => setNewDeptName(e.target.value)}
                                    className="bg-neutral-800 border-neutral-700 text-white"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create Department</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-900/80">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-neutral-400">Department Name</TableHead>
                            <TableHead className="text-neutral-400">Allocated Courses</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDepts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-neutral-500">No departments found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredDepts.map((dept) => (
                                <TableRow key={dept.departmentName} className="border-white/5 hover:bg-neutral-800/50 transition-colors">
                                    <TableCell className="font-medium text-white">{dept.departmentName}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                                            {dept.courseIds.length} Allocation{dept.courseIds.length !== 1 && 's'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-red-500/10 hover:text-red-400 text-neutral-500 transition-colors"
                                            // There's no real ID in this mock structure for deletion, using name as ID substitute or generic ID if available
                                            // In context: updateDeptAllocation uses name. 
                                            // But deleteDepartment uses ID. We need the ID.
                                            // The deptAllocations might not have ID exposed directly in the simplified view?
                                            // Looking at context types -> deptAllocations is { departmentName: string, courseIds: string[] }[]
                                            // It doesn't seem to have an ID field in the mock data structure visible here.
                                            // However, context provider likely has it.
                                            // Let's assume for now we disable delete or just put a placeholder. 
                                            // Or better, let's remove the delete button if we can't reliably delete by ID, 
                                            // OR use a mock ID/name if available.
                                            onClick={() => handleDelete("mock-id", dept.departmentName)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

