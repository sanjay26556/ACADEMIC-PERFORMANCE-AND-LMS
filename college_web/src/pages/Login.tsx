import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/api";

const Login = () => {
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await auth.login(registerNumber, password);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // Store the user name for display
      localStorage.setItem("currentUserName", user.name || "User");

      if (user.role === 'student') localStorage.setItem("currentStudentEmail", user.email || "");
      if (user.role === 'teacher') localStorage.setItem("currentTeacherEmail", user.email || "");

      if (user.first_login) {
        toast({
          title: "First Login Detected",
          description: "You must change your password to continue.",
        });
        navigate("/change-password");
        return;
      }

      toast({
        title: `Welcome back, ${user.name || "User"}!`,
        description: "Redirecting to your dashboard...",
      });

      // Redirect based on role
      switch (user.role) {
        case "student":
          navigate("/dashboard/student");
          break;
        case "teacher":
          navigate("/dashboard/teacher");
          break;

        case "admin":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <GraduationCap className="h-10 w-10 text-primary relative z-10" />
          </div>
          <span className="font-display font-bold text-2xl">
            Edu<span className="text-primary">Pulse</span>
          </span>
        </Link>

        <Card variant="glass" className="backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <Badge variant="glass" className="w-fit mx-auto mb-4">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Secure Login
            </Badge>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your Register Number and Password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="regNum" className="text-sm font-medium">
                  Register Number / Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="regNum"
                    type="text"
                    placeholder="e.g. 21CSE045 or email@college.edu"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="pl-10"
                    variant="glass"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    variant="glass"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
