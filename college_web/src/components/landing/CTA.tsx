import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative Element */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-8 animate-bounce">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your
            <br />
            <span className="gradient-text">Academic Experience?</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of students, teachers, and institutions already using EduPulse 
            to achieve academic excellence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Create Free Account
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="glass" size="xl">
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Free forever for students
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
