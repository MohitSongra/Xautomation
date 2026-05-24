import { NextRequest, NextResponse } from "next/server";
import { generateText, parseAIJson } from "@/lib/ai";
import { SYSTEM_PROMPT, buildIdeaGenerationPrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";
import type { AIGeneratedIdea } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categories = [],
      count = 5,
      persona_tone,
      persona_topics,
      avoid_list,
    } = body;

    const prompt = buildIdeaGenerationPrompt(
      categories,
      count,
      persona_tone,
      persona_topics,
      avoid_list
    );

    const { text, provider } = await generateText(prompt, SYSTEM_PROMPT);
    const parsed = parseAIJson<{ ideas: AIGeneratedIdea[] }>(text);

    // Save ideas to Supabase
    const ideasToInsert = parsed.ideas.map((idea) => ({
      user_id: user.id,
      content: idea.content,
      category: idea.category,
      virality_score: idea.virality_score,
      engagement_prediction: idea.engagement_prediction,
      reasoning: idea.reasoning,
      status: "new",
      source_type: "ai",
    }));

    const { data: insertedIdeas, error: insertError } = await supabase
      .from("tweet_ideas")
      .insert(ideasToInsert)
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "Failed to save ideas to database" }, { status: 500 });
    }

    return NextResponse.json({
      ideas: insertedIdeas,
      provider,
      count: insertedIdeas.length,
    });
  } catch (error) {
    console.error("Idea generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate ideas. Check your AI API keys." },
      { status: 500 }
    );
  }
}
