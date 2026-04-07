
import { useState } from "react";
import { useLMS } from "@/context/LMSContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Search, ShieldAlert, Mail, User as UserIcon, Filter, X, Trophy, Crown, ShieldCheck, BookOpen, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Unified User Type
type UserRole = 'student' | 'teacher' | 'admin';
type UserStatus = 'active' | 'suspended' | 'inactive';

interface UnifiedUser {
    id: string;
    originalId: string | number;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
    joinDate: string;
    avatarUrl?: string;
    relatedCourses?: any[];
}

export function UserDirectory() {
    const { students, teachers, courses, deleteUser } = useLMS();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
    const [selectedUser, setSelectedUser] = useState<UnifiedUser | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // 1. Aggregate Data
    const allUsers: UnifiedUser[] = [
        ...students.map((s: any) => {
            const studentCourses = s.enrolled_courses || [];
            return {
                id: `s-${s.id}`,
                originalId: s.id,
                name: s.name,
                email: s.email,
                role: 'student' as UserRole,
                department: s.department,
                status: 'active' as UserStatus,
                joinDate: '2024-01-15',
                relatedCourses: courses ? courses.filter((c: any) => studentCourses.includes(c.id)) : []
            };
        }),
        ...teachers.map((t: any) => {
            const teacherCourses = t.assigned_courses || [];
            return {
                id: `t-${t.id}`,
                originalId: t.id,
                name: t.name,
                email: t.email,
                role: 'teacher' as UserRole,
                department: t.department,
                status: 'active' as UserStatus,
                joinDate: '2023-08-20',
                relatedCourses: courses ? courses.filter((c: any) => teacherCourses.includes(c.id)) : []
            };
        }),
        {
            id: 'admin-1',
            originalId: 'admin-1',
            name: 'System Administrator',
            email: 'admin@college.edu',
            role: 'admin' as UserRole,
            department: 'IT Administration',
            status: 'active' as UserStatus,
            joinDate: '2023-01-01',
            relatedCourses: []
        }
    ];

    // 2. Filter Data
    const filteredUsers = allUsers.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // 3. Handlers
    const handleViewProfile = (user: UnifiedUser) => {
        setSelectedUser(user);
        setIsProfileOpen(true);
    };

    const handleDeleteUser = (user: UnifiedUser) => {
        if (user.role === 'admin') {
            toast.error("Cannot delete the main administrator.");
            return;
        }

        if (confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
            if (user.role === 'student') {
                deleteUser(Number(user.originalId));
                toast.success("Student deleted successfully.");
            } else if (user.role === 'teacher') {
                deleteUser(Number(user.originalId));
                toast.success("Teacher deleted successfully.");
            }
        }
    };

    const handleSuspendUser = (user: UnifiedUser) => {
        toast.info(`${user.name} has been suspended (Mock Action).`);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'teacher': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'student': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            default: return 'bg-neutral-800 text-neutral-400';
        }
    };

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'admin': return <Crown className="w-3 h-3 text-orange-400" />;
            case 'teacher': return <ShieldCheck className="w-3 h-3 text-purple-400" />;
            case 'student': return <UserIcon className="w-3 h-3 text-cyan-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Stats - Gamified */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 shadow-lg shadow-orange-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserIcon className="w-24 h-24 text-orange-500 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-orange-200/60 font-medium tracking-wide uppercase text-xs">Total Users</CardDescription>
                        <CardTitle className="text-4xl font-black text-orange-100">{allUsers.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs font-semibold text-orange-300">
                            <Sparkles className="w-3 h-3" />
                            <span>Across all roles</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Total Students</CardDescription>
                        <CardTitle className="text-4xl font-black text-cyan-100 group-hover:text-cyan-400 transition-colors">
                            {students.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <UserIcon className="w-3 h-3 text-cyan-400" />
                            <span>Active Students</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-neutral-900/60 backdrop-blur-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-neutral-500 font-medium tracking-wide uppercase text-xs">Total Teachers</CardDescription>
                        <CardTitle className="text-4xl font-black text-purple-100 group-hover:text-purple-400 transition-colors">{teachers.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-neutral-400 flex items-center gap-2">
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                            <span>Active Teachers</span>
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
                        placeholder="Search directory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-neutral-950/50 border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all rounded-xl"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                        <SelectTrigger className="w-[180px] bg-neutral-950/50 border-neutral-800 text-neutral-300 rounded-xl focus:ring-cyan-500/20">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-neutral-500" />
                                <SelectValue placeholder="All Roles" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                            <SelectItem value="all">All Alliances</SelectItem>
                            <SelectItem value="student">Students</SelectItem>
                            <SelectItem value="teacher">Teachers</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Orange Action Button inspired by user upload */}
                    <div className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-orange-900/20 cursor-pointer transition-all hover:scale-105 active:scale-95 font-medium text-sm">
                        <UserIcon className="w-4 h-4" />
                        <span>Users</span>
                    </div>

                    {roleFilter !== 'all' && (
                        <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(""); setRoleFilter("all"); }} className="text-neutral-500 hover:text-red-400">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid Layout for Gamified Feel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 bg-neutral-900/20 rounded-3xl border border-dashed border-neutral-800">
                        <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8 text-neutral-600" />
                        </div>
                        <p className="text-neutral-400 font-medium">No players found matching your criteria.</p>
                        <Button variant="outline" onClick={() => { setSearchTerm(""); setRoleFilter("all"); }} className="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <HoverCard key={user.id} openDelay={200} closeDelay={100}>
                            <HoverCardTrigger asChild>
                                <Card className="group bg-neutral-900/40 backdrop-blur-sm border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 rounded-2xl overflow-hidden relative flex flex-col cursor-pointer" onClick={() => handleViewProfile(user)}>
                                    {/* Decorative Top Border based on Role */}
                                    <div className={`h-1 w-full absolute top-0 left-0 ${user.role === 'admin' ? 'bg-orange-500' :
                                        user.role === 'teacher' ? 'bg-purple-500' :
                                            'bg-cyan-500'
                                        }`} />

                                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-neutral-950 border-neutral-800 text-neutral-300">
                                                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewProfile(user); }} className="focus:bg-neutral-800 focus:text-white cursor-pointer">
                                                    <UserIcon className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}>
                                                    <X className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <CardContent className="pt-8 pb-4 flex-1 flex flex-col items-center text-center space-y-4">
                                        <div className="relative">
                                            <div className={`absolute -inset-1 rounded-full blur opacity-0 group-hover:opacity-50 transition duration-500 ${user.role === 'admin' ? 'bg-orange-500' :
                                                user.role === 'teacher' ? 'bg-purple-500' :
                                                    'bg-cyan-500'
                                                }`}></div>
                                            <Avatar className="h-20 w-20 border-2 border-neutral-800 relative shadow-xl">
                                                <AvatarImage src={user.avatarUrl} />
                                                <AvatarFallback className={`text-lg font-bold ${user.role === 'admin' ? 'bg-orange-500 text-white' :
                                                    user.role === 'teacher' ? 'bg-purple-900 text-purple-200' :
                                                        'bg-cyan-950 text-cyan-300'
                                                    }`}>
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-2 -right-2 bg-neutral-900 rounded-full p-1 border border-neutral-800">
                                                <div className={`p-1 rounded-full ${user.role === 'admin' ? 'bg-orange-500/20' :
                                                    user.role === 'teacher' ? 'bg-purple-500/20' :
                                                        'bg-cyan-500/20'
                                                    }`}>
                                                    {getRoleIcon(user.role)}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-cyan-400 transition-colors">{user.name}</h3>
                                            <p className="text-xs text-neutral-500 mt-1 font-mono">{user.email}</p>
                                        </div>

                                        <Badge variant="outline" className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </Badge>
                                    </CardContent>

                                    <CardFooter className="bg-neutral-900/30 border-t border-white/5 p-4 w-full mt-auto">
                                        <div className="w-full space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-neutral-500 font-medium">Courses</span>
                                                <span className="text-cyan-400 font-mono">{user.relatedCourses?.length || 0} enrolled</span>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </HoverCardTrigger>
                            <HoverCardContent 
                                side="bottom" 
                                align="center" 
                                className="w-64 bg-neutral-950/95 backdrop-blur-xl border-neutral-800 p-4 space-y-3 z-50 shadow-2xl"
                            >
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        {user.role === 'teacher' ? 'Assigned Courses' : 'Enrolled Courses'}
                                    </h4>
                                    <p className="text-xs text-neutral-500">
                                        {user.relatedCourses?.length} courses total
                                    </p>
                                </div>
                                
                                {user.relatedCourses && user.relatedCourses.length > 0 ? (
                                    <ScrollArea className="h-40 rounded-md">
                                        <div className="space-y-2 pr-4">
                                            {user.relatedCourses.map(course => (
                                                <div key={course.id} className="text-xs p-2 rounded bg-neutral-900 border border-white/5 space-y-1">
                                                    <div className="font-medium text-neutral-200">{course.name}</div>
                                                    <div className="text-neutral-500 flex justify-between">
                                                        <span>{course.code}</span>
                                                        <span>Sem {course.semester}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="text-xs text-neutral-500 text-center py-4 bg-neutral-900/50 rounded-lg border border-dashed border-white/5">
                                        No courses attached.
                                    </div>
                                )}
                            </HoverCardContent>
                        </HoverCard>
                    ))
                )}
            </div>

            {/* Profile Dialog - Gamified */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-md bg-neutral-950 border-neutral-800 text-neutral-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-cyan-400" />
                            User Details
                        </DialogTitle>
                        <DialogDescription className="text-neutral-500">
                            Comprehensive dashboard and course details for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6 py-6">
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-500 rounded-full blur-md opacity-40"></div>
                                    <Avatar className="h-24 w-24 border-4 border-neutral-900 relative">
                                        <AvatarFallback className="text-3xl bg-neutral-800 text-white font-bold"> {getInitials(selectedUser.name)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="space-y-1.5 flex-1 w-full min-w-0">
                                    <h4 className="text-2xl font-bold text-white truncate">{selectedUser.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={`${getRoleBadgeColor(selectedUser.role)} pointer-events-none`}>{selectedUser.role.toUpperCase()}</Badge>
                                        <span className="text-xs text-neutral-500 font-mono bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 whitespace-nowrap">
                                            ID: {selectedUser.originalId}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="truncate">{selectedUser.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Department</label>
                                    <p className="text-sm font-medium text-white">{selectedUser.department}</p>
                                </div>
                                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 space-y-1">
                                    <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Status</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <p className="text-sm font-medium text-green-400">Active</p>
                                    </div>
                                </div>
                            </div>

                            {/* Related Courses Section */}
                            <div className="space-y-3 bg-neutral-900/30 p-4 rounded-xl border border-white/5 flex flex-col max-h-[220px]">
                                <div className="flex justify-between items-center pb-2 border-b border-white/5 shrink-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        {selectedUser.role === 'teacher' ? 'Assigned Courses' : 'Enrolled Courses'}
                                    </div>
                                    <Badge variant="outline" className="bg-neutral-950 border-neutral-800 text-neutral-400">
                                        {selectedUser.relatedCourses?.length || 0}
                                    </Badge>
                                </div>
                                
                                <ScrollArea className="flex-1 pr-4">
                                    {selectedUser.relatedCourses && selectedUser.relatedCourses.length > 0 ? (
                                        <div className="space-y-2 pt-2 pb-2">
                                            {selectedUser.relatedCourses.map((course: any) => (
                                                <div key={course.id} className="flex flex-col p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60 hover:border-cyan-500/30 transition-colors">
                                                    <div className="flex items-start justify-between">
                                                        <span className="text-sm font-medium text-neutral-200 line-clamp-1">{course.name}</span>
                                                        <span className="text-xs font-mono text-cyan-400/80 bg-cyan-950/30 px-2 py-0.5 rounded">{course.code}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Year {course.year}</span>
                                                        <span>Sem {course.semester}</span>
                                                        {course.section && <span>Sec {course.section}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-neutral-500">
                                            <BookOpen className="w-8 h-8 opacity-20 mb-2" />
                                            <p className="text-xs">No courses available for this user.</p>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsProfileOpen(false)} className="text-neutral-400 hover:text-white hover:bg-neutral-800">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
