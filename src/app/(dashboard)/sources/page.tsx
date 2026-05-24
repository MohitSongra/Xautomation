"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Globe, RefreshCw, ExternalLink, TrendingUp, Plus, Rss } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  url: string;
  source: string;
  score: number;
  summary: string;
}

const mockTrending: TrendingItem[] = [
  { id: "1", title: "Show HN: I built an AI agent that writes production code", url: "#", source: "hackernews", score: 342, summary: "Developer shares an open-source AI coding agent that generates production-ready code with tests." },
  { id: "2", title: "Rust vs Go in 2026: Which should you choose?", url: "#", source: "devto", score: 89, summary: "A comprehensive comparison of Rust and Go for backend development in 2026." },
  { id: "3", title: "vercel/ai-chatbot — Open source Next.js AI chatbot", url: "#", source: "github", score: 1200, summary: "Full-featured AI chatbot built with Next.js, Vercel AI SDK, and multiple LLM providers." },
  { id: "4", title: "Why I left FAANG to build my own AI startup", url: "#", source: "hackernews", score: 567, summary: "Senior engineer shares lessons learned leaving Google to build an AI-first product." },
  { id: "5", title: "The state of TypeScript in 2026", url: "#", source: "devto", score: 134, summary: "Overview of TypeScript's evolution and the latest features developers should know." },
];

const sources = [
  { name: "Hacker News", type: "hackernews", active: true, lastFetched: "2h ago" },
  { name: "GitHub Trending", type: "github", active: true, lastFetched: "4h ago" },
  { name: "Dev.to", type: "devto", active: true, lastFetched: "6h ago" },
  { name: "Reddit (RSS)", type: "reddit", active: false, lastFetched: "Never" },
];

const sourceColors: Record<string, string> = {
  hackernews: "bg-orange-500/10 text-orange-400",
  github: "bg-gray-500/10 text-gray-400",
  devto: "bg-blue-500/10 text-blue-400",
  reddit: "bg-red-500/10 text-red-400",
};

export default function SourcesPage() {
  const [trending] = useState(mockTrending);
  const [fetching, setFetching] = useState(false);

  const handleFetch = async () => {
    setFetching(true);
    await new Promise((r) => setTimeout(r, 2000));
    setFetching(false);
  };

  return (
    <>
      <Topbar title="Content Sources" description="Trending tech topics for inspiration" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={handleFetch} loading={fetching} icon={<RefreshCw className="h-4 w-4" />}>
            {fetching ? "Fetching..." : "Fetch Trending"}
          </Button>
          <Button variant="secondary" icon={<Plus className="h-4 w-4" />}>
            Add Source
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Trending items */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Trending Topics</h3>
            {trending.length === 0 ? (
              <EmptyState
                icon={<Globe className="h-8 w-8" />}
                title="No trending topics"
                description="Fetch topics from your configured sources."
              />
            ) : (
              trending.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceColors[item.source]}`}>
                              {item.source}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-text-tertiary">
                              <TrendingUp className="h-3 w-3" /> {item.score}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-text-primary">{item.title}</h4>
                          <p className="mt-1 text-xs text-text-secondary line-clamp-2">{item.summary}</p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />} />
                          <Button variant="secondary" size="sm">
                            Use as Idea
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Source config */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Rss className="h-4 w-4 text-accent-amber" />
                  Configured Sources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sources.map((source) => (
                  <div key={source.type} className="flex items-center justify-between rounded-lg bg-bg-tertiary p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{source.name}</p>
                      <p className="text-xs text-text-tertiary">Last: {source.lastFetched}</p>
                    </div>
                    <Badge variant={source.active ? "success" : "default"}>
                      {source.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
