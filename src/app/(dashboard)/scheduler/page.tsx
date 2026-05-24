"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, ChevronLeft, ChevronRight, Trash2, Send } from "lucide-react";
import type { ScheduledPost } from "@/types";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const bestTimes = [
  { time: "8:00 AM", label: "Morning boost", engagement: "High" },
  { time: "12:30 PM", label: "Lunch break", engagement: "Medium" },
  { time: "6:00 PM", label: "Evening wind-down", engagement: "Highest" },
  { time: "9:00 PM", label: "Night scroll", engagement: "Medium" },
];

export default function SchedulerPage() {
  const [items, setItems] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState(new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }));
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadScheduledPosts() {
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .order("scheduled_for", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch scheduled posts:", error);
      }

      if (data) {
        setItems(data as ScheduledPost[]);
      }
      setLoading(false);
    }

    void loadScheduledPosts();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handlePostNow = async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: "publishing" } : it)));
    
    // Mark as pending and update time to now
    await supabase
      .from("scheduled_posts")
      .update({ scheduled_for: new Date().toISOString(), status: "pending" })
      .eq("id", id);
      
    // Manually trigger the cron route for this specific post immediately
    void fetch(`/api/cron/post?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    await supabase.from("scheduled_posts").delete().eq("id", id);
  };

  return (
    <>
      <Topbar title="Scheduler" description="Plan and schedule your content" />
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar placeholder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-accent-blue" />
                  Content Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <button className="rounded-md p-1 text-text-tertiary hover:bg-white/5 hover:text-text-primary">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-text-primary">{currentMonth}</span>
                  <button className="rounded-md p-1 text-text-tertiary hover:bg-white/5 hover:text-text-primary">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-px rounded-lg border border-border-default bg-border-default overflow-hidden">
                  {/* Day headers */}
                  {daysOfWeek.map((day) => (
                    <div key={day} className="bg-bg-tertiary p-2 text-center text-xs font-medium text-text-tertiary">
                      {day}
                    </div>
                  ))}
                  {/* Calendar cells — simplified grid */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const today = new Date();
                    // Basic calendar math for current month
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
                    const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon = 0
                    const dayNum = i - dayOffset; 
                    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                    
                    const isCurrentMonth = dayNum >= 0 && dayNum < daysInMonth;
                    const day = dayNum + 1;
                    const isToday = isCurrentMonth && day === today.getDate();
                    
                    // Find posts for this day
                    const postsForDay = items.filter(it => {
                      if (!isCurrentMonth) return false;
                      const postDate = new Date(it.scheduled_for);
                      return postDate.getDate() === day && postDate.getMonth() === today.getMonth();
                    });

                    return (
                      <div
                        key={i}
                        className={`relative min-h-[72px] bg-bg-secondary p-1.5 ${
                          !isCurrentMonth ? "opacity-30" : ""
                        } ${isToday ? "ring-1 ring-accent-blue ring-inset" : ""}`}
                      >
                        {isCurrentMonth && (
                          <>
                            <span className={`text-xs ${isToday ? "font-bold text-accent-blue" : "text-text-secondary"}`}>
                              {day}
                            </span>
                            {postsForDay.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {postsForDay.slice(0,2).map(post => (
                                  <div key={post.id} className="rounded bg-accent-purple/15 px-1 py-0.5 text-[9px] text-accent-purple truncate">
                                    {post.content.slice(0, 20)}...
                                  </div>
                                ))}
                                {postsForDay.length > 2 && (
                                  <div className="text-[9px] text-text-tertiary">+{postsForDay.length - 2} more</div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Best times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-accent-amber" />
                  Best Times to Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bestTimes.map((slot) => (
                  <div key={slot.time} className="flex items-center justify-between rounded-lg bg-bg-tertiary p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{slot.time}</p>
                      <p className="text-xs text-text-tertiary">{slot.label}</p>
                    </div>
                    <span className={`text-xs font-medium ${
                      slot.engagement === "Highest" ? "text-accent-green" :
                      slot.engagement === "High" ? "text-accent-blue" : "text-text-secondary"
                    }`}>
                      {slot.engagement}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="Loading schedule"
                description="Fetching scheduled posts."
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-8 w-8" />}
                title="Queue is empty"
                description="Approve drafts and schedule them to populate your queue."
              />
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 rounded-xl border border-border-default bg-bg-tertiary/50 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{item.content}</p>
                      <p className="mt-1 text-xs text-text-tertiary">
                        {new Date(item.scheduled_for).toLocaleString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={item.status === "pending" ? "scheduled" : item.status === "published" ? "published" : "draft"} />
                    <div className="flex gap-1">
                      <Button onClick={() => handlePostNow(item.id)} variant="ghost" size="sm" icon={<Send className="h-3.5 w-3.5" />}>
                        Post Now
                      </Button>
                      <Button onClick={() => handleDelete(item.id)} variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} className="text-text-tertiary" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
