"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, Save, Plus, X, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PersonaConfig } from "@/types";

const defaultTopics = ["AI", "coding", "startups", "software engineering", "developer productivity", "build-in-public"];
const defaultAvoid = ["cringe AI phrases", "excessive emojis", "generic motivation", "repetitive sentence structures"];

export default function PersonaPage() {
  const [tone, setTone] = useState("intelligent, concise, technical, slightly opinionated");
  const [topics, setTopics] = useState(defaultTopics);
  const [avoid, setAvoid] = useState(defaultAvoid);
  const [voiceNotes, setVoiceNotes] = useState(
    "I'm a developer/AI engineer who builds in public. I prefer short punchy tweets mixed with technical depth. I don't use threads often but when I do, they're substantial."
  );
  const [newTopic, setNewTopic] = useState("");
  const [newAvoid, setNewAvoid] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadPersona() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("persona_config")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      setUserId(user.id);

      if (error) {
        console.error("Failed to fetch persona:", error);
      }

      if (data?.persona_config) {
        const config = data.persona_config as Partial<PersonaConfig>;
        if (config.tone) setTone(config.tone);
        if (config.topics) setTopics(config.topics);
        if (config.avoid) setAvoid(config.avoid);
        if (config.voice_notes !== undefined) setVoiceNotes(config.voice_notes);
      }
    }

    void loadPersona();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    
    const config = {
      tone,
      topics,
      avoid,
      voice_notes: voiceNotes
    };

    const { error } = await supabase
      .from("profiles")
      .update({ persona_config: config })
      .eq("id", userId);

    if (error) {
      console.error("Failed to save persona:", error);
    }
    
    setSaving(false);
  };

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const addAvoid = () => {
    if (newAvoid.trim() && !avoid.includes(newAvoid.trim())) {
      setAvoid([...avoid, newAvoid.trim()]);
      setNewAvoid("");
    }
  };

  return (
    <>
      <Topbar title="Persona Settings" description="Define your creator voice and style" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* Tone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-accent-purple" />
              Writing Tone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Describe your tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g., intelligent, concise, technical"
            />
            <p className="mt-2 text-xs text-text-tertiary">
              This guides the AI when generating content. Be specific about how you want to sound.
            </p>
          </CardContent>
        </Card>

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent-blue" />
              Favorite Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Badge key={topic} variant="default" className="gap-1.5 pr-1.5">
                  {topic}
                  <button
                    onClick={() => setTopics(topics.filter((t) => t !== topic))}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              />
              <Button variant="secondary" onClick={addTopic} icon={<Plus className="h-4 w-4" />}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Avoid list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-accent-rose">Things to Avoid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {avoid.map((item) => (
                <Badge key={item} variant="danger" className="gap-1.5 pr-1.5">
                  {item}
                  <button
                    onClick={() => setAvoid(avoid.filter((a) => a !== item))}
                    className="ml-1 rounded-full p-0.5 hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newAvoid}
                onChange={(e) => setNewAvoid(e.target.value)}
                placeholder="Add something to avoid..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAvoid())}
              />
              <Button variant="secondary" onClick={addAvoid} icon={<Plus className="h-4 w-4" />}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Voice Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="Describe your writing style, preferences, and any specific instructions for the AI..."
              className="min-h-[120px]"
            />
            <p className="mt-2 text-xs text-text-tertiary">
              Free-form notes about your voice. The AI uses this as additional context when writing.
            </p>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving} icon={<Save className="h-4 w-4" />} size="lg">
            Save Persona
          </Button>
        </div>
      </div>
    </>
  );
}
