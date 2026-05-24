"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  Filter,
} from "lucide-react";
import type { IdeaStatus, TweetIdea } from "@/types";

const categories = ["all", "AI", "software engineering", "build-in-public", "startups", "developer productivity", "coding"];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<TweetIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadIdeas() {
      const { data, error } = await supabase
        .from("tweet_ideas")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch ideas:", error);
      }

      if (data) {
        setIdeas(data as TweetIdea[]);
      }
      setLoading(false);
    }

    void loadIdeas();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const filteredIdeas = ideas.filter((idea) => {
    if (activeCategory !== "all" && idea.category !== activeCategory) return false;
    if (activeStatus !== "all" && idea.status !== activeStatus) return false;
    return true;
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 }),
      });
      const data = (await res.json()) as { ideas?: TweetIdea[] };
      const generatedIdeas = data.ideas;
      if (generatedIdeas) {
        setIdeas((prev) => [...generatedIdeas, ...prev]);
      }
    } catch (err: unknown) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: IdeaStatus) => {
    // Optimistic update
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea))
    );

    const { error } = await supabase
      .from("tweet_ideas")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status", error);
      // Revert if needed, ignored for simplicity
    }
  };

  const handleDraft = async (idea: TweetIdea) => {
    // Generate draft
    try {
      // First update status to drafted
      await handleStatusChange(idea.id, "drafted");
      
      const res = await fetch("/api/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: idea.id,
          idea_content: idea.content,
          tweet_type: "tweet"
        }),
      });
      
      if (res.ok) {
        // Just redirect to drafts page, they can see the new draft there
        window.location.href = "/drafts";
      }
    } catch (err: unknown) {
      console.error("Failed to generate draft", err);
    }
  };

  return (
    <>
      <Topbar title="Tweet Ideas" description="AI-generated content ideas" />
      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={handleGenerate}
            loading={generating}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {generating ? "Generating..." : "Generate More Ideas"}
          </Button>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-tertiary" />
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="h-9 rounded-lg border border-border-default bg-bg-secondary px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="selected">Selected</option>
              <option value="drafted">Drafted</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {/* Ideas list */}
        {loading ? (
          <EmptyState
            icon={<Lightbulb className="h-10 w-10" />}
            title="Loading ideas"
            description="Fetching your saved tweet ideas."
          />
        ) : filteredIdeas.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="h-10 w-10" />}
            title="No ideas yet"
            description="Generate your first batch of AI-powered tweet ideas."
            action={
              <Button onClick={handleGenerate} icon={<Sparkles className="h-4 w-4" />}>
                Generate Ideas
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredIdeas.map((idea, i) => (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant={idea.status === "dismissed" ? "default" : idea.status === "selected" ? "success" : "default"}>
                          {idea.status}
                        </Badge>
                        <span className="shrink-0 rounded-full bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-tertiary">
                          {idea.category}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm leading-relaxed text-text-primary">
                        {idea.content}
                      </p>

                      {/* Scores */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-accent-amber" />
                          <span className="text-xs text-text-secondary">
                            Virality: <span className="font-medium text-text-primary">{idea.virality_score}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
                          <span className="text-xs text-text-secondary">
                            Engagement: <span className="font-medium text-text-primary">{idea.engagement_prediction}</span>
                          </span>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <p className="text-xs text-text-tertiary italic">
                        💡 {idea.reasoning}
                      </p>

                      {/* Actions */}
                      {idea.status === "new" && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<Check className="h-3.5 w-3.5" />}
                            onClick={() => handleStatusChange(idea.id, "selected")}
                          >
                            Select
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<ArrowRight className="h-3.5 w-3.5" />}
                            onClick={() => handleDraft(idea)}
                          >
                            Draft
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<X className="h-3.5 w-3.5" />}
                            onClick={() => handleStatusChange(idea.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
