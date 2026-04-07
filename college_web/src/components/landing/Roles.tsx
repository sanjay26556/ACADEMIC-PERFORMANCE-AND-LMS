import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  Settings,
  ArrowRight,
  BookOpen,
  BarChart3,
  Calendar,
  Trophy,
  FileText,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    title: "Student",
    description: "Track your academic journey, complete assignments, and earn achievements.",
    icon: GraduationCap,
    color: "primary",
    features: [
      { icon: BookOpen, label: "Access Courses" },
      { icon: BarChart3, label: "View GPA/CGPA" },
      { icon: Trophy, label: "Earn Badges" },
      { icon: Calendar, label: "Track Attendance" },
    ],
  },
  {
    title: "Teacher",
    description: "Create courses, grade assignments, and monitor student progress.",
    icon: Users,
    color: "secondary",
    features: [
      { icon: FileText, label: "Create Content" },
      { icon: BarChart3, label: "Grade Work" },
      { icon: Calendar, label: "Mark Attendance" },
      { icon: Bell, label: "Send Updates" },
    ],
  },
  {
    title: "Admin",
    description: "Manage users, departments, and oversee platform analytics.",
    icon: Settings,
    color: "accent",
    features: [
      { icon: Users, label: "Manage Users" },
      { icon: BarChart3, label: "View Analytics" },
      { icon: Settings, label: "Configure System" },
      { icon: Bell, label: "Platform Updates" },
    ],
  },
];

const Roles = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="glass" className="mb-4">
            <Users className="h-4 w-4 mr-2" />
            For Everyone
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Tailored <span className="gradient-text">Dashboards</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each role gets a personalized experience designed for their specific needs and workflows.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <Card 
              key={index}
              variant="glass"
              className="group hover:border-primary/30 transition-all duration-500"
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 rounded-2xl bg-${role.color}/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <role.icon className={`h-10 w-10 text-${role.color}`} />
                </div>
                <CardTitle className="text-2xl">{role.title}</CardTitle>
                <CardDescription className="text-base">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {role.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <feature.icon className="h-4 w-4 text-primary" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
                <Link to="/register">
                  <Button variant="outline" className="w-full group/btn">
                    Get Started
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roles;
