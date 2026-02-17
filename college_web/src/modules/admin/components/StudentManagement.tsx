import { useState } from "react";
import { useLMS, Student } from "@/context/LMSContext";
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
import { Plus, Trash2, Search, Users, GraduationCap, BarChart } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function StudentManagement() {
    const { students, addStudent, deleteUser } = useLMS();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        register_number: "",
        department: "",
        dob: "",
        email: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.register_number || !formData.dob) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await addStudent(formData);
            setIsOpen(false);
            setFormData({ name: "", register_number: "", department: "", dob: "", email: "" });
        } catch (error) {
            // Error handled in context
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to remove this student?")) {
            await deleteUser(id);
        }
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.register_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-200/60 uppercase text-xs">Total Students</CardDescription>
                        <CardTitle className="text-4xl font-black text-emerald-100">{students.length}</CardTitle>
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
                        <Button className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
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
                                <Label>Register Number*</Label>
                                <Input
                                    value={formData.register_number}
                                    onChange={e => setFormData({ ...formData, register_number: e.target.value })}
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
                                <Label>Email (Optional)</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-neutral-800 border-neutral-700"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Enroll Student</Button>
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
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-32 text-neutral-500">No students found.</TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student, idx) => (
                                <TableRow key={student.id} className="border-white/5 hover:bg-neutral-800/50 transition-colors">
                                    <TableCell className="text-neutral-500">{idx + 1}</TableCell>
                                    <TableCell className="font-medium text-white flex items-center gap-3">
                                        <Avatar className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/20">
                                            <AvatarFallback className="text-emerald-500 text-xs">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {student.name}
                                    </TableCell>
                                    <TableCell className="text-neutral-400">{student.register_number}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
                                            {student.department || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-red-500/10 hover:text-red-400 text-neutral-500 transition-colors"
                                            onClick={() => handleDelete(student.user_id)} // Use user_id for deletion
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
