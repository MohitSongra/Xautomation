"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Zap,
  LayoutDashboard,
  Lightbulb,
  FileEdit,
  Calendar,
  BarChart3,
  Globe,
  Brain,
  Sparkles,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/ideas", label: "Tweet Ideas", icon: Lightbulb },
  { href: "/drafts", label: "Drafts", icon: FileEdit },
  { href: "/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/sources", label: "Sources", icon: Globe },
  { href: "/persona", label: "Persona", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border-default bg-bg-secondary/80 backdrop-blur-xl lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border-default px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-text-primary">Xautomation</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-accent-blue" : "text-text-tertiary group-hover:text-text-secondary"
                )}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-blue" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Generate */}
      <div className="border-t border-border-default p-4">
        <Button className="w-full" icon={<Sparkles className="h-4 w-4" />}>
          Quick Generate
        </Button>
      </div>

      {/* User section */}
      <div className="border-t border-border-default p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-tertiary text-xs font-medium text-text-secondary">
            LA
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-text-primary">Local Admin</p>
            <p className="truncate text-xs text-text-tertiary">local@xautomation.app</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
