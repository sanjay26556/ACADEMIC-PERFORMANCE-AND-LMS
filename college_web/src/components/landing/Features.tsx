import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Users, 
  Bell, 
  Calendar,
  FileText,
  Target,
  Flame,
  Award,
  TrendingUp,
  Shield
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Access materials, videos, and resources organized by semester and department.",
    color: "text-primary",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: FileText,
    title: "Assignments & Quizzes",
    description: "Submit work, take auto-graded quizzes, and receive instant feedback.",
    color: "text-secondary",
    gradient: "from-secondary/20 to-transparent",
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description: "View your attendance calendar and maintain healthy attendance percentages.",
    color: "text-accent",
    gradient: "from-accent/20 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track GPA/CGPA with beautiful charts and detailed grade history.",
    color: "text-info",
    gradient: "from-info/20 to-transparent",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Earn badges, collect points, level up, and maintain achievement streaks.",
    color: "text-level-gold",
    gradient: "from-level-gold/20 to-transparent",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description: "Never miss deadlines with instant updates on assignments and grades.",
    color: "text-warning",
    gradient: "from-warning/20 to-transparent",
  },
];

const gamificationBadges = [
  { name: "First Steps", icon: Target, level: "bronze", description: "Complete your first course" },
  { name: "Streak Master", icon: Flame, level: "gold", description: "7-day learning streak" },
  { name: "Top Performer", icon: Award, level: "platinum", description: "Score 90%+ in 5 quizzes" },
  { name: "Rising Star", icon: TrendingUp, level: "silver", description: "Improve GPA by 0.5" },
];

const Features = () => {
  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="glass" className="mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Powerful Features
          </Badge>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive platform designed to enhance your academic experience with 
            modern tools and gamified learning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              variant="interactive"
              className="group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <CardHeader className="relative">
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gamification Showcase */}
        <div className="text-center mb-12">
          <Badge variant="gold" className="mb-4">
            <Trophy className="h-4 w-4 mr-2" />
            Gamification
          </Badge>
          <h3 className="font-display text-2xl md:text-4xl font-bold mb-4">
            Earn Badges & Level Up
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stay motivated with our achievement system. Complete challenges and unlock exclusive rewards.
          </p>
        </div>

        {/* Badges Showcase */}
        <div className="flex flex-wrap justify-center gap-6">
          {gamificationBadges.map((badge, index) => (
            <Card 
              key={index}
              variant="glow"
              className="w-48 text-center hover:scale-105 transition-transform duration-300"
            >
              <CardContent className="pt-6">
                <div className="relative inline-block mb-4">
                  <div className={`absolute inset-0 bg-level-${badge.level}/30 blur-xl rounded-full`} />
                  <div className={`relative w-16 h-16 rounded-full bg-level-${badge.level}/20 flex items-center justify-center border-2 border-level-${badge.level}`}>
                    <badge.icon className={`h-8 w-8 text-level-${badge.level}`} />
                  </div>
                </div>
                <Badge variant={badge.level as any} className="mb-2">
                  {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                </Badge>
                <h4 className="font-semibold mb-1">{badge.name}</h4>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
