
import { Building2, Search, BookOpen, GraduationCap, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useLMS } from "@/context/LMSContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

const collegeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

export function CollegeManagement() {
    const { colleges, addCollege } = useLMS();
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const collegeForm = useForm<z.infer<typeof collegeSchema>>({
        resolver: zodResolver(collegeSchema),
        defaultValues: { name: "", email: "", address: "", contactNumber: "" },
    });

    const onCollegeSubmit = (data: z.infer<typeof collegeSchema>) => {
        addCollege({
            ...data,
            id: "",
            allocatedCourses: []
        } as import("@/context/LMSContext").College);
        toast.success("College enrolled successfully!");
        collegeForm.reset();
        setIsOpen(false);
    };

    const filteredColleges = colleges.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAllocations = colleges.reduce((acc, c) => acc + c.allocatedCourses.length, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 shadow-lg shadow-indigo-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Building2 className="w-24 h-24 text-indigo-500 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-indigo-200/60 font-medium tracking-wide uppercase text-xs">Partner Colleges</CardDescription>
                        <CardTitle className="text-4xl font-black text-indigo-100">{colleges.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                            <GraduationCap className="w-3 h-3" />
                            <span>Institutions</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Course Load</CardDescription>
                        <CardTitle className="text-4xl font-black text-cyan-100 group-hover:text-cyan-400 transition-colors">
                            {totalAllocations}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <BookOpen className="w-3 h-3 text-cyan-400" />
                            <span>Total Courses Run</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Satisfaction</CardDescription>
                        <CardTitle className="text-4xl font-black text-purple-100 group-hover:text-purple-400 transition-colors">4.8/5</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-neutral-400 flex items-center gap-2">
                            <span>Admin Rating</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-neutral-500 group-focus-within:text-cyan-400 transition-colors" />
                    </div>
                    <Input
                        placeholder="Search colleges..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all rounded-xl"
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95 font-medium text-sm border-0">
                            <Plus className="h-4 w-4" /> Enroll College
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Enroll New College</DialogTitle>
                            <DialogDescription className="text-neutral-400">
                                Register a new partner college to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...collegeForm}>
                            <form onSubmit={collegeForm.handleSubmit(onCollegeSubmit)} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={collegeForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-neutral-300">College Name</FormLabel>
                                                <FormControl><Input placeholder="Institute of Technology" {...field} className="bg-neutral-800 border-neutral-700 text-white" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={collegeForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-neutral-300">Official Email</FormLabel>
                                                <FormControl><Input placeholder="contact@college.edu" {...field} className="bg-neutral-800 border-neutral-700 text-white" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={collegeForm.control}
                                        name="contactNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-neutral-300">Contact Number</FormLabel>
                                                <FormControl><Input placeholder="+1 234 567 890" {...field} className="bg-neutral-800 border-neutral-700 text-white" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={collegeForm.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-neutral-300">Address</FormLabel>
                                                <FormControl><Input placeholder="123 Education Lane" {...field} className="bg-neutral-800 border-neutral-700 text-white" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Ensure Enrollment</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-neutral-900/40 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-neutral-900/80">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-neutral-400">Name</TableHead>
                            <TableHead className="text-neutral-400">Email</TableHead>
                            <TableHead className="text-neutral-400">Allocated Courses</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredColleges.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-32 text-neutral-500">No colleges registered.</TableCell>
                            </TableRow>
                        ) : (
                            filteredColleges.map((c) => (
                                <TableRow key={c.id} className="border-white/5 hover:bg-neutral-800/50 transition-colors">
                                    <TableCell className="font-medium text-white">{c.name}</TableCell>
                                    <TableCell className="text-neutral-300">{c.email}</TableCell>
                                    <TableCell className="text-neutral-400">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/30 text-indigo-400 border border-indigo-800/50">
                                            {c.allocatedCourses.length} Courses
                                        </span>
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
