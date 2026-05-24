"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "py-16 px-6",
        className
      )}
    >
      <div className="mb-4 text-text-tertiary opacity-60">
        {icon || <Inbox className="h-12 w-12" strokeWidth={1.5} />}
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </motion.div>
  );
}

EmptyState.displayName = "EmptyState";

export { EmptyState };
