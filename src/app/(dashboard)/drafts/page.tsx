"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { createClient } from "@/lib/supabase/client";
import {
  FileEdit,
  RefreshCw,
  Minus,
  Plus,
  Zap,
  Check,
  Calendar,
  Trash2,
  ChevronRight,
  Shield,
} from "lucide-react";
import { getCharacterCount } from "@/lib/utils";
import type { TweetDraft, TweetStatus } from "@/types";

type RewriteResponse = {
  content?: string;
  error?: string;
};

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<TweetDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadDrafts() {
      const { data, error } = await supabase
        .from("tweet_drafts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Failed to fetch drafts:", error);
      }

      if (data) {
        const typedDrafts = data as TweetDraft[];
        setDrafts(typedDrafts);
        setSelectedId((currentSelectedId) => {
          if (!currentSelectedId && typedDrafts.length > 0) {
            setEditContent(typedDrafts[0].content);
            return typedDrafts[0].id;
          }
          return currentSelectedId;
        });
      }
      setLoading(false);
    }

    void loadDrafts();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const selectedDraft = drafts.find((d) => d.id === selectedId);
  const charInfo = getCharacterCount(editContent);

  const handleSelect = (draft: TweetDraft) => {
    setSelectedId(draft.id);
    setEditContent(draft.content);
  };

  const handleStatusChange = async (id: string, status: TweetStatus) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    await supabase.from("tweet_drafts").update({ status }).eq("id", id);
  };

  const handleContentUpdate = async () => {
    if (!selectedId || !selectedDraft) return;
    
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === selectedId ? { ...d, content: editContent, version: d.version + 1 } : d
      )
    );

    await supabase
      .from("tweet_drafts")
      .update({ content: editContent, version: selectedDraft.version + 1 })
      .eq("id", selectedId);
  };

  const handleRewrite = async (instruction: string) => {
    if (!selectedId || !editContent || !selectedDraft) return;
    setRewriting(true);
    
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editContent,
          action: "custom",
          custom_instruction: instruction,
        }),
      });
      const data = (await res.json()) as RewriteResponse;
      if (!res.ok) {
        throw new Error(data.error || "Failed to rewrite draft");
      }
      if (data.content) {
        setEditContent(data.content);
        // We do not auto-save until they hit a save/approve button, or we can auto-save.
        // Let's auto-save for better UX
        setDrafts((prev) =>
          prev.map((d) =>
            d.id === selectedId ? { ...d, content: data.content!, version: d.version + 1 } : d
          )
        );
        await supabase
          .from("tweet_drafts")
          .update({ content: data.content, version: selectedDraft.version + 1 })
          .eq("id", selectedId);
      }
    } catch (err: unknown) {
      console.error("Failed to rewrite draft:", err);
    } finally {
      setRewriting(false);
    }
  };

  const handleSchedule = async (draft: TweetDraft) => {
    try {
      await handleStatusChange(draft.id, "scheduled");
      // Schedule for 24 hours from now as a default for MVP
      const scheduledFor = new Date(Date.now() + 86400000).toISOString();
      
      const { error } = await supabase.from("scheduled_posts").insert({
        user_id: draft.user_id, // we might need to get user_id from session or draft
        draft_id: draft.id,
        content: draft.content,
        scheduled_for: scheduledFor,
        status: "pending",
      });

      if (error) {
        console.error("Failed to schedule:", error);
      }
    } catch (err: unknown) {
      console.error("Failed to schedule draft:", err);
    }
  };

  return (
    <>
      <Topbar title="Drafts" description="Review and edit AI-generated content" />
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left panel — Draft list */}
        <div className="w-full border-r border-border-default lg:w-80 xl:w-96 overflow-y-auto">
          <div className="p-4 space-y-2">
            {loading ? (
              <EmptyState
                icon={<FileEdit className="h-8 w-8" />}
                title="Loading drafts"
                description="Fetching your current drafts."
              />
            ) : drafts.length === 0 ? (
              <EmptyState
                icon={<FileEdit className="h-8 w-8" />}
                title="No drafts"
                description="Generate drafts from your ideas."
              />
            ) : (
              drafts.map((draft) => (
                <motion.button
                  key={draft.id}
                  onClick={() => handleSelect(draft)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedId === draft.id
                      ? "border-accent-blue/30 bg-accent-blue/5"
                      : "border-border-default bg-bg-secondary hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={draft.status} />
                    <span className="text-[10px] text-text-tertiary">v{draft.version}</span>
                  </div>
                  <p className="text-sm text-text-primary line-clamp-3">{draft.content}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-accent-green" />
                      <span className="text-[10px] text-text-tertiary">
                        Human Score: {draft.human_score || 0}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Right panel — Editor */}
        <div className="hidden flex-1 flex-col lg:flex">
          {selectedDraft ? (
            <div className="flex flex-1 flex-col p-6 space-y-4 overflow-y-auto">
              {/* Draft header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedDraft.status} />
                  <span className="text-sm text-text-secondary">
                    {selectedDraft.tweet_type} • v{selectedDraft.version}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-full bg-accent-green/10 px-2.5 py-1">
                    <Shield className="h-3.5 w-3.5 text-accent-green" />
                    <span className="text-xs font-medium text-accent-green">
                      {selectedDraft.human_score || 0}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={handleContentUpdate}
                    disabled={rewriting}
                    maxLength={280}
                    showCount
                    className="min-h-[160px] resize-none border-none bg-transparent p-0 text-base focus:ring-0"
                    placeholder="Write your tweet..."
                  />
                </CardContent>
              </Card>

              {/* Character count bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      charInfo.isOver ? "bg-accent-rose" : charInfo.remaining < 30 ? "bg-accent-amber" : "bg-accent-blue"
                    }`}
                    style={{ width: `${Math.min((charInfo.count / 280) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-mono ${charInfo.isOver ? "text-accent-rose" : "text-text-tertiary"}`}>
                  {charInfo.remaining}
                </span>
              </div>

              {/* Rewrite options */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<RefreshCw className={`h-3.5 w-3.5 ${rewriting ? "animate-spin" : ""}`} />}
                  onClick={() => handleRewrite("Make it punchier and more engaging, acting as a tech creator.")}
                  disabled={rewriting}
                >
                  Regenerate
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Minus className="h-3.5 w-3.5" />}
                  onClick={() => handleRewrite("Make it significantly shorter and more concise while keeping the main point.")}
                  disabled={rewriting}
                >
                  Shorten
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => handleRewrite("Expand this into a more detailed tweet with more context.")}
                  disabled={rewriting}
                >
                  Expand
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={<Zap className="h-3.5 w-3.5" />}
                  onClick={() => handleRewrite("Rewrite this to have a stronger hook and be highly viral.")}
                  disabled={rewriting}
                >
                  Make Punchier
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border-default">
                <Button
                  onClick={() => {
                    handleContentUpdate();
                    handleStatusChange(selectedDraft.id, "approved");
                  }}
                  icon={<Check className="h-4 w-4" />}
                >
                  Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSchedule(selectedDraft)}
                  icon={<Calendar className="h-4 w-4" />}
                >
                  Schedule
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleStatusChange(selectedDraft.id, "archived")}
                  icon={<Trash2 className="h-4 w-4" />}
                  className="ml-auto text-text-tertiary"
                >
                  Archive
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<FileEdit className="h-10 w-10" />}
                title="Select a draft"
                description="Choose a draft from the list to edit."
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
