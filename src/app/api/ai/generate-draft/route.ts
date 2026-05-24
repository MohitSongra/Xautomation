import { NextRequest, NextResponse } from "next/server";
import { generateText, parseAIJson } from "@/lib/ai";
import { SYSTEM_PROMPT, buildDraftGenerationPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { AIGeneratedDraft } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { idea_id, idea_content, tweet_type = "tweet", persona_tone } = body;

    if (!idea_content) {
      return NextResponse.json(
        { error: "idea_content is required" },
        { status: 400 }
      );
    }

    const prompt = buildDraftGenerationPrompt(idea_content, tweet_type, persona_tone);
    const { text, provider } = await generateText(prompt, SYSTEM_PROMPT);
    const generatedDraft = parseAIJson<AIGeneratedDraft>(text);

    // Save to Supabase
    const { data: insertedDraft, error: insertError } = await supabase
      .from("tweet_drafts")
      .insert({
        user_id: user.id,
        idea_id: idea_id || null,
        content: generatedDraft.content,
        tweet_type: tweet_type,
        status: "draft",
        human_score: generatedDraft.human_score,
        safety_flags: generatedDraft.safety_flags,
        tone_analysis: generatedDraft.tone_analysis,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
    }

    return NextResponse.json({ draft: insertedDraft, provider });
  } catch (error) {
    console.error("Draft generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate draft. Check your AI API keys." },
      { status: 500 }
    );
  }
}
