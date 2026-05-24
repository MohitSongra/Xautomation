"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import {
  Lightbulb,
  FileEdit,
  Send,
  TrendingUp,
  Sparkles,
  Calendar,
  ArrowRight,
  Zap,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ScheduledPost } from "@/types";

type OverviewStats = {
  ideas: number;
  drafts: number;
  published: number;
};

export default function OverviewPage() {
  const [statsData, setStatsData] = useState<OverviewStats>({
    ideas: 0,
    drafts: 0,
    published: 0,
  });
  const [upcomingPosts, setUpcomingPosts] = useState<ScheduledPost[]>([]);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      // Fetch counts
      const { count: ideasCount } = await supabase
        .from("tweet_ideas")
        .select("*", { count: "exact", head: true });
      const { count: draftsCount } = await supabase
        .from("tweet_drafts")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft");
      const { count: publishedCount } = await supabase
        .from("scheduled_posts")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      const { data: upcoming } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("status", "pending")
        .order("scheduled_for", { ascending: true })
        .limit(3);

      if (cancelled) return;

      setStatsData({
        ideas: ideasCount || 0,
        drafts: draftsCount || 0,
        published: publishedCount || 0,
      });

      if (upcoming) {
        setUpcomingPosts(upcoming as ScheduledPost[]);
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const stats = [
    {
      label: "Ideas Generated",
      value: statsData.ideas.toString(),
      change: "All time",
      icon: Lightbulb,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
    },
    {
      label: "Pending Drafts",
      value: statsData.drafts.toString(),
      change: "Needs review",
      icon: FileEdit,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      label: "Published",
      value: statsData.published.toString(),
      change: "All time",
      icon: Send,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      label: "Avg. Engagement",
      value: "N/A", // Will be implemented in Analytics phase
      change: "Awaiting data",
      icon: TrendingUp,
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <>
      <Topbar title="Overview" description="Your content command center" />
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                <CardContent className="relative flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-text-primary">{stat.value}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{stat.change}</p>
                  </div>
                  <div className="rounded-lg bg-bg-primary/40 p-2.5">
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-accent-amber" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => router.push("/ideas")}
                  variant="secondary" 
                  className="w-full justify-start" 
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Generate Tweet Ideas
                </Button>
                <Button 
                  onClick={() => router.push("/drafts")}
                  variant="secondary" 
                  className="w-full justify-start" 
                  icon={<FileEdit className="h-4 w-4" />}
                >
                  Review Drafts
                </Button>
                <Button 
                  onClick={() => router.push("/scheduler")}
                  variant="secondary" 
                  className="w-full justify-start" 
                  icon={<Calendar className="h-4 w-4" />}
                >
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity Placeholder (Can be implemented fully later) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-accent-blue" />
                  System Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-text-tertiary">
                  (Activity log is currently disabled, wait for Phase 3 to connect to activity_log table)
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-accent-green" />
                  Upcoming Posts
                </CardTitle>
                <Button onClick={() => router.push("/scheduler")} variant="ghost" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingPosts.length === 0 ? (
                  <p className="text-sm text-text-tertiary">No upcoming posts scheduled.</p>
                ) : (
                  upcomingPosts.map((post, i) => (
                    <div key={i} className="rounded-lg border border-border-default bg-bg-tertiary/50 p-3">
                      <p className="text-sm text-text-primary line-clamp-2">{post.content}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-text-tertiary">
                          {new Date(post.scheduled_for).toLocaleString("en-US", { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="rounded-full bg-accent-purple/10 px-2 py-0.5 text-[10px] font-medium text-accent-purple">
                          pending
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
