import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = "shimmer rounded-[var(--radius-md)]";

  if (variant === "circular") {
    return (
      <div
        className={cn(baseClasses, "rounded-full", className)}
        style={{
          width: width || 40,
          height: height || width || 40,
          ...style,
        }}
        aria-hidden
        {...props}
      />
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("flex flex-col gap-2", className)} aria-hidden {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, "h-4")}
            style={{
              width:
                i === lines - 1 && lines > 1 ? "60%" : width || "100%",
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  // rectangular (default)
  return (
    <div
      className={cn(baseClasses, className)}
      style={{
        width: width || "100%",
        height: height || 20,
        ...style,
      }}
      aria-hidden
      {...props}
    />
  );
}

Skeleton.displayName = "Skeleton";

export { Skeleton };
