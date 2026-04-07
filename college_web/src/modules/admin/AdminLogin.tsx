import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { auth } from "@/lib/api";
import { Home } from "lucide-react";

const AdminLogin = () => {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await auth.login(identifier, password);
            const { token, user } = res.data;

            if (user.role !== 'admin') {
                toast.error("Access denied. Not an admin account.");
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success("Welcome back, Admin!");
            navigate("/lms/admin/dashboard");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] p-4">
            <div className="absolute top-4 left-4 md:top-8 md:left-8">
                <Link to="/">
                    <Button variant="ghost" className="text-neutral-400 hover:text-white">
                        <Home className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Back to Home</span>
                    </Button>
                </Link>
            </div>

            <div className="mb-8 text-center mt-12 md:mt-0">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">EduPulse LMS</h1>
                <p className="text-neutral-500 mt-2">Learning Management System</p>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 pb-2">
                    <CardTitle className="text-2xl font-bold text-center text-white">Admin Login</CardTitle>
                    <CardDescription className="text-center text-neutral-400">System Administration</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-200">Admin ID / Email</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                                id="email"
                                type="text"
                                placeholder="admin"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-neutral-200">Password</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-white text-black hover:bg-neutral-200 h-10 text-base">
                            Access Control Panel
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AdminLogin;
