import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── StatsCardsSkeleton ────────────────────────────── */

export interface StatsCardsSkeletonProps {
  count?: number;
  className?: string;
}

function StatsCardsSkeleton({ count = 4, className }: StatsCardsSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] bg-bg-secondary/80 border border-border-default p-5 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
          <Skeleton height={28} width="40%" />
          <Skeleton variant="text" width="70%" />
        </div>
      ))}
    </div>
  );
}

StatsCardsSkeleton.displayName = "StatsCardsSkeleton";

/* ─── ListSkeleton ──────────────────────────────────── */

export interface ListSkeletonProps {
  count?: number;
  className?: string;
}

function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] bg-bg-secondary/80 border border-border-default divide-y divide-border-subtle",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton variant="text" width={i % 2 === 0 ? "80%" : "65%"} />
            <Skeleton variant="text" width={i % 2 === 0 ? "50%" : "40%"} />
          </div>
          <Skeleton width={72} height={28} className="rounded-[var(--radius-full)]" />
        </div>
      ))}
    </div>
  );
}

ListSkeleton.displayName = "ListSkeleton";

/* ─── EditorSkeleton ────────────────────────────────── */

export interface EditorSkeletonProps {
  className?: string;
}

function EditorSkeleton({ className }: EditorSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4",
        className
      )}
    >
      {/* Main editor area */}
      <div className="rounded-[var(--radius-lg)] bg-bg-secondary/80 border border-border-default p-5 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width={32} height={32} className="rounded-[var(--radius-sm)]" />
          ))}
          <div className="flex-1" />
          <Skeleton width={100} height={36} className="rounded-[var(--radius-md)]" />
        </div>

        {/* Text area */}
        <Skeleton height={200} />

        {/* Character count */}
        <div className="flex justify-end">
          <Skeleton width={60} height={16} />
        </div>
      </div>

      {/* Sidebar */}
      <div className="rounded-[var(--radius-lg)] bg-bg-secondary/80 border border-border-default p-5 flex flex-col gap-4">
        <Skeleton variant="text" width="60%" />
        <Skeleton height={120} />
        <Skeleton variant="text" lines={3} />
        <div className="mt-auto pt-4 flex flex-col gap-2">
          <Skeleton height={40} className="rounded-[var(--radius-md)]" />
          <Skeleton height={40} className="rounded-[var(--radius-md)]" />
        </div>
      </div>
    </div>
  );
}

EditorSkeleton.displayName = "EditorSkeleton";

export { StatsCardsSkeleton, ListSkeleton, EditorSkeleton };
