import * as React from "react";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    bg: "bg-accent-blue/10",
    text: "text-accent-blue",
    dot: "bg-accent-blue",
    border: "border-accent-blue/20",
  },
  reviewing: {
    label: "Reviewing",
    bg: "bg-accent-amber/10",
    text: "text-accent-amber",
    dot: "bg-accent-amber",
    border: "border-accent-amber/20",
  },
  approved: {
    label: "Approved",
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    dot: "bg-accent-green",
    border: "border-accent-green/20",
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-accent-purple/10",
    text: "text-accent-purple",
    dot: "bg-accent-purple",
    border: "border-accent-purple/20",
  },
  published: {
    label: "Published",
    bg: "bg-accent-cyan/10",
    text: "text-accent-cyan",
    dot: "bg-accent-cyan",
    border: "border-accent-cyan/20",
  },
  archived: {
    label: "Archived",
    bg: "bg-white/5",
    text: "text-text-tertiary",
    dot: "bg-text-tertiary",
    border: "border-white/10",
  },
} as const;

export type TweetStatus = keyof typeof statusConfig;

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TweetStatus;
}

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-xs font-medium px-2.5 py-1",
        "rounded-[var(--radius-full)] border",
        "select-none whitespace-nowrap",
        "transition-colors duration-200",
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0 animate-pulse",
          config.dot
        )}
      />
      {config.label}
    </span>
  );
}

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusConfig };
