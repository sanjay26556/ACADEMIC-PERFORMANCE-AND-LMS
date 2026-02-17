import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "border-primary/50 text-primary",
        success: "border-transparent bg-success text-foreground",
        warning: "border-transparent bg-warning text-foreground",
        info: "border-transparent bg-info text-foreground",
        glass: "border-border/50 bg-card/60 backdrop-blur-sm text-foreground",
        bronze: "border-transparent bg-level-bronze text-foreground shadow-lg",
        silver: "border-transparent bg-level-silver text-background shadow-lg",
        gold: "border-transparent bg-level-gold text-background shadow-lg",
        platinum: "border-transparent bg-level-platinum text-background shadow-lg",
        diamond: "border-transparent bg-level-diamond text-background shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
