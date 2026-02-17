import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  BookOpen, 
  TrendingUp,
  Zap
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 animate-fade-in">
            <Badge variant="glass" className="px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Next-Gen Learning Platform
            </Badge>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Transform Your
            <br />
            <span className="gradient-text">Academic Journey</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Track performance, earn achievements, and excel in your studies with our 
            gamified learning management system designed for modern students.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Start Learning Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="glass" size="xl">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: BookOpen, value: "500+", label: "Courses" },
              { icon: Trophy, value: "50K+", label: "Students" },
              { icon: TrendingUp, value: "95%", label: "Success Rate" },
              { icon: Zap, value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div key={index} className="glass-card p-4 rounded-2xl hover:scale-105 transition-transform duration-300">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float hidden lg:block">
          <div className="glass-card p-3 rounded-xl">
            <Trophy className="h-8 w-8 text-level-gold" />
          </div>
        </div>
        <div className="absolute top-40 right-10 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
          <div className="glass-card p-3 rounded-xl">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float hidden lg:block" style={{ animationDelay: '4s' }}>
          <div className="glass-card p-3 rounded-xl">
            <Zap className="h-8 w-8 text-accent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
