import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
  success:
    "bg-accent-green/10 text-accent-green border-accent-green/20",
  warning:
    "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  danger:
    "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
  purple:
    "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
} as const;

const badgeDotColors = {
  default: "bg-accent-blue",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  danger: "bg-accent-rose",
  purple: "bg-accent-purple",
} as const;

const badgeSizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;
export type BadgeSize = keyof typeof badgeSizes;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium border rounded-[var(--radius-full)]",
          "transition-colors duration-200",
          "select-none whitespace-nowrap",
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0 animate-pulse",
              badgeDotColors[variant]
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
