
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLMS } from "@/context/LMSContext";

const CollegeLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { colleges } = useLMS();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple mock: if email matches any enrolled college or is generic mock
        const college = colleges.find(c => c.email === email);

        if (college || email === "college@lms.com") {
            toast.success("Welcome, College Administrator!");
            // In a real app we would store the current college ID in context/session
            // For now, we'll assume a single active session relevant to the demo
            navigate("/lms/college/dashboard");
        } else {
            toast.error("College not enrolled. Please contact Admin.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] p-4">
            <Card className="w-full max-w-md shadow-2xl border-neutral-800 bg-neutral-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-blue-400">College Portal</CardTitle>
                    <CardDescription className="text-center text-neutral-400">Manage your institution's courses and departments</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-neutral-200">College Email</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-blue-500"
                                id="email"
                                type="email"
                                placeholder="college@lms.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-neutral-200">Password</Label>
                            <Input
                                className="bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-blue-500"
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
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Access Dashboard</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default CollegeLogin;
