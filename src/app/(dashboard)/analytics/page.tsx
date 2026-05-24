"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Heart,
  Repeat,
  MessageCircle,
  Eye,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PostAnalytics } from "@/types";

type AnalyticsRow = Pick<
  PostAnalytics,
  "likes" | "reposts" | "replies" | "impressions" | "engagement_rate"
> & {
  published_posts: { content: string } | null;
};

type TopTweet = {
  content: string;
  likes: number;
  reposts: number;
  impressions: number;
  engagement: number;
};

type WeeklyDatum = {
  day: string;
  posts: number;
  engagement: number;
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    likes: 0,
    reposts: 0,
    replies: 0,
    impressions: 0,
  });
  const [topTweets, setTopTweets] = useState<TopTweet[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      // In a real app we'd fetch post_analytics joined with published_posts
      // For now we'll do a simple fetch
      const { data: analyticsData } = await supabase
        .from("post_analytics")
        .select("*, published_posts(content)");

      if (cancelled || !analyticsData || analyticsData.length === 0) return;

      let totalLikes = 0;
      let totalReposts = 0;
      let totalReplies = 0;
      let totalImpressions = 0;

      const tweets = (analyticsData as AnalyticsRow[]).map((a) => {
        totalLikes += a.likes || 0;
        totalReposts += a.reposts || 0;
        totalReplies += a.replies || 0;
        totalImpressions += a.impressions || 0;

        return {
          content: a.published_posts?.content || "Unknown tweet",
          likes: a.likes || 0,
          reposts: a.reposts || 0,
          impressions: a.impressions || 0,
          engagement: a.engagement_rate || 0,
        };
      });

      setMetrics({
        likes: totalLikes,
        reposts: totalReposts,
        replies: totalReplies,
        impressions: totalImpressions,
      });

      tweets.sort((a, b) => b.engagement - a.engagement);
      setTopTweets(tweets.slice(0, 5));
    }

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const displayMetrics = [
    { label: "Total Likes", value: metrics.likes.toString(), change: "+0%", up: true, icon: Heart, color: "text-accent-rose" },
    { label: "Reposts", value: metrics.reposts.toString(), change: "+0%", up: true, icon: Repeat, color: "text-accent-green" },
    { label: "Replies", value: metrics.replies.toString(), change: "0%", up: false, icon: MessageCircle, color: "text-accent-blue" },
    { label: "Impressions", value: metrics.impressions.toString(), change: "+0%", up: true, icon: Eye, color: "text-accent-purple" },
  ];

  // Placeholder weekly data until we have enough history to calculate it
  const chartData: WeeklyDatum[] = [
    { day: "Mon", posts: 0, engagement: 0 },
    { day: "Tue", posts: 0, engagement: 0 },
    { day: "Wed", posts: 0, engagement: 0 },
    { day: "Thu", posts: 0, engagement: 0 },
    { day: "Fri", posts: 0, engagement: 0 },
    { day: "Sat", posts: 0, engagement: 0 },
    { day: "Sun", posts: 0, engagement: 0 },
  ];
  const maxEngagement = Math.max(...chartData.map((d) => d.engagement)) || 1;

  return (
    <>
      <Topbar title="Analytics" description="Track your content performance" />
      <div className="p-6 space-y-6">
        {/* Metrics grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="rounded-lg bg-bg-tertiary p-2.5">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">{metric.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
                      <span className={`flex items-center text-xs font-medium ${metric.up ? "text-accent-green" : "text-accent-rose"}`}>
                        {metric.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Engagement chart (CSS-based bar chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-accent-blue" />
                Weekly Engagement Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 h-48">
                {chartData.map((day) => (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-mono text-text-tertiary">{day.engagement}%</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.engagement / maxEngagement) * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="w-full rounded-t-md bg-gradient-to-t from-accent-blue to-accent-purple"
                    />
                    <span className="text-xs text-text-tertiary">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top performing tweets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-accent-green" />
                Top Performing Tweets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topTweets.length === 0 ? (
                <p className="text-sm text-text-tertiary">No analytics data available yet.</p>
              ) : (
                topTweets.map((tweet, i) => (
                  <div key={i} className="rounded-lg border border-border-default bg-bg-tertiary/50 p-3">
                    <p className="text-sm text-text-primary mb-2 truncate">{tweet.content}</p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-accent-rose" /> {tweet.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3 text-accent-green" /> {tweet.reposts}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-accent-purple" /> {tweet.impressions >= 1000 ? (tweet.impressions / 1000).toFixed(1) + 'K' : tweet.impressions}
                      </span>
                      <span className="ml-auto font-medium text-accent-blue">
                        {tweet.engagement}% engagement
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
