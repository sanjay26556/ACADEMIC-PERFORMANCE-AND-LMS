import { useState } from "react";
import { useLMS, Teacher } from "@/context/LMSContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
const DEPARTMENTS = [
    "CSE (Computer Science & Engineering)",
    "ECE (Electronics & Communication Engineering)",
    "EEE (Electrical & Electronics Engineering)",
    "Mechanical Engineering",
    "Aeronautical Engineering",
    "Biomedical Engineering",
    "Architecture"
];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Search, Users, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TeacherManagement() {
    const { teachers, addTeacher, deleteUser } = useLMS();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        register_number: "",
        department: "",
        dob: "",
        email: "",
        password: "",
        roleType: "Teacher"
    });

    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.dob || !formData.email || !formData.department) {
            toast.error("Please fill in all required fields including Department");
            return;
        }

        // Auto-generate register number for teachers if not provided
        const teacherData = {
            ...formData,
            register_number: `TCH${Date.now().toString().slice(-6)}` // Simple auto-gen
        };

        try {
            await addTeacher(teacherData);
            setIsOpen(false);
            setFormData({ name: "", register_number: "", department: "", dob: "", email: "", password: "", roleType: "Teacher" });
        } catch (error) {
            // Error handled in context
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to remove this teacher?")) {
            await deleteUser(id);
        }
    }

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.register_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-lg shadow-blue-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-200/60 uppercase text-xs">Total Teachers</CardDescription>
                        <CardTitle className="text-4xl font-black text-blue-100">{teachers.length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Search by Name or Register No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-neutral-950/50 border-neutral-800 text-neutral-200"
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Teacher</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name*</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Date of Birth* (YYYY-MM-DD)</Label>
                                <Input
                                    type="date"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Password (Optional)</Label>
                                <Input
                                    type="text"
                                    placeholder="Leave blank to use DOB as password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700"
                                />
                                <p className="text-xs text-neutral-500">Default: YYYY-MM-DD if left blank</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Department*</Label>
                                <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                        {DEPARTMENTS.map((dept) => (
                                            <SelectItem key={dept} value={dept}>
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Role*</Label>
                                <Select value={formData.roleType} onValueChange={(val) => setFormData({ ...formData, roleType: val })}>
                                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                                        <SelectItem value="Teacher">Teacher</SelectItem>
                                        <SelectItem value="HOD">HOD</SelectItem>
                                        <SelectItem value="Staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Email (Optional)</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Add Teacher</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-900/80">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-[50px] text-neutral-400">No.</TableHead>
                            <TableHead className="text-neutral-400">Name</TableHead>
                            <TableHead className="text-neutral-400">Register No</TableHead>
                            <TableHead className="text-neutral-400">Department</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-neutral-500">No teachers found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredTeachers.map((teacher, idx) => (
                                <TableRow key={teacher.id} className="border-white/5 hover:bg-neutral-800/50 transition-colors">
                                    <TableCell className="text-neutral-500">{idx + 1}</TableCell>
                                    <TableCell className="font-medium text-white flex items-center gap-3">
                                        <Avatar className="h-8 w-8 bg-blue-500/10 border border-blue-500/20">
                                            <AvatarFallback className="text-blue-500 text-xs">{teacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {teacher.name}
                                    </TableCell>
                                    <TableCell className="text-neutral-400">{teacher.register_number}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                                            {teacher.department || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-red-500/10 hover:text-red-400 text-neutral-500 transition-colors"
                                            onClick={() => handleDelete(teacher.id)}
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
