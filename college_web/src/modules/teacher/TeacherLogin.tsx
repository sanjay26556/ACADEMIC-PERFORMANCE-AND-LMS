
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { auth } from "@/lib/api";

const TeacherLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // API expects register_number, but we modified backend to accept email in that field
            const res = await auth.login(email, password);
            const { token, user } = res.data;

            if (user.role !== 'teacher') {
                toast.error("Access denied. Not a teacher account.");
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success("Welcome, Professor!");
            navigate("/lms/teacher/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))] p-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">EduPulse LMS</h1>
                <p className="text-neutral-500 mt-2">Learning Management System</p>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-2">
                    {/* Top Switcher */}
                    <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-neutral-950/50 rounded-lg border border-neutral-800">
                        <Link to="/lms/student/login">
                            <Button variant="ghost" className="w-full text-neutral-400 hover:text-green-400 hover:bg-neutral-800/50">Student</Button>
                        </Link>
                        <Button variant="ghost" className="bg-neutral-800 text-amber-400 shadow-sm">Teacher</Button>
                        <Link to="/lms/admin/login">
                            <Button variant="ghost" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800/50">Admin</Button>
                        </Link>
                    </div>

                    <CardTitle className="text-2xl font-bold text-center text-amber-400">Teacher Portal</CardTitle>
                    <CardDescription className="text-center text-neutral-400">Manage student enrollments and progress</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-200">Teacher Email</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                                id="email"
                                type="email"
                                placeholder="teacher@lms.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-neutral-200">Password</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-amber-500"
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 h-10 text-base">
                            Enter Staff Room
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default TeacherLogin;
