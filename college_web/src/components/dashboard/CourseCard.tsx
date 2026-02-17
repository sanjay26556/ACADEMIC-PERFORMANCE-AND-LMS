import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
  students?: number;
  category: string;
  image?: string;
}

const CourseCard = ({
  title,
  instructor,
  progress,
  totalLessons,
  completedLessons,
  duration,
  students,
  category,
}: CourseCardProps) => {
  const getProgressColor = () => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "gradient";
    return "default";
  };

  return (
    <Card variant="interactive" className="overflow-hidden group">
      {/* Course Image Placeholder */}
      <div className="h-32 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,hsl(var(--primary)/0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
        <div className="absolute top-3 left-3">
          <Badge variant="glass" className="backdrop-blur-md">
            {category}
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/50 backdrop-blur-sm">
          <Button variant="hero" size="sm">
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{instructor}</p>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{completedLessons}/{totalLessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          {students && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{students}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} color={getProgressColor()} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
