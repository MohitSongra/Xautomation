import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai";
import { SYSTEM_PROMPT, buildRewritePrompt } from "@/lib/ai/prompts";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, action, custom_instruction } = body;

    if (!content || !action) {
      return NextResponse.json(
        { error: "content and action are required" },
        { status: 400 }
      );
    }

    const prompt = buildRewritePrompt(content, action, custom_instruction);
    const { text, provider } = await generateText(prompt, SYSTEM_PROMPT);

    return NextResponse.json({
      content: text.trim().replace(/^["']|["']$/g, ""),
      original_content: content,
      action,
      provider,
    });
  } catch (error) {
    console.error("Rewrite failed:", error);
    return NextResponse.json(
      { error: "Failed to rewrite. Check your AI API keys." },
      { status: 500 }
    );
  }
}
