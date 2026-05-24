"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-default bg-bg-primary/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="text-xs text-text-tertiary">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-border-default bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-accent-blue focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-rose" />
        </button>

        {/* New Draft */}
        <Button size="sm" icon={<Plus className="h-4 w-4" />}>
          New Draft
        </Button>
      </div>
    </header>
  );
}
