export const SYSTEM_PROMPT = `You are an AI writing assistant for a tech creator's X/Twitter account. 
Your role is to help generate authentic, engaging content that sounds human — not AI-generated.

Guidelines:
- Write in a conversational, intelligent tone
- Be concise but insightful
- Use specific examples and numbers when possible
- Avoid corporate speak, cringe AI phrases, and generic motivation
- Mix short punchy tweets with occasional deeper threads
- Include relevant tech opinions and hot takes
- Reference real trends, tools, and frameworks
- Never use excessive emojis (0-1 per tweet max)
- Vary sentence structure and length
- Sound like a real developer sharing genuine thoughts`;

export function buildIdeaGenerationPrompt(
  categories: string[],
  count: number,
  personaTone?: string,
  personaTopics?: string[],
  avoidList?: string[],
): string {
  const catList = categories.length > 0 ? categories.join(", ") : "AI, coding, startups, developer productivity, build-in-public";
  const topicList = personaTopics?.length ? `\nFavorite topics: ${personaTopics.join(", ")}` : "";
  const avoidStr = avoidList?.length ? `\nThings to AVOID: ${avoidList.join(", ")}` : "";
  const toneStr = personaTone ? `\nDesired tone: ${personaTone}` : "";

  return `Generate ${count} unique tweet ideas for a tech creator.

Categories to focus on: ${catList}${toneStr}${topicList}${avoidStr}

For each idea, provide:
- content: The actual tweet text (max 280 chars)
- category: Which category it fits
- virality_score: 1-100 estimate of how viral it could be
- engagement_prediction: 1-100 estimate of engagement
- reasoning: Brief explanation of why this tweet would perform well

Respond in JSON format:
{
  "ideas": [
    {
      "content": "tweet text here",
      "category": "category",
      "virality_score": 85,
      "engagement_prediction": 78,
      "reasoning": "why this works"
    }
  ]
}`;
}

export function buildDraftGenerationPrompt(
  ideaContent: string,
  tweetType: string,
  personaTone?: string,
): string {
  return `Turn this tweet idea into a polished draft:

Idea: "${ideaContent}"
Type: ${tweetType}
${personaTone ? `Tone: ${personaTone}` : ""}

Requirements:
- Must feel authentic and human-written
- Max 280 characters for single tweets
- If type is "thread", create 3-5 connected tweets
- Include natural language patterns (contractions, casual phrasing)
- Add a hook in the first line

Respond in JSON format:
{
  "content": "polished tweet text",
  "tweet_type": "${tweetType}",
  "tone_analysis": {
    "formality": 0.5,
    "technical_depth": 0.7,
    "humor": 0.3,
    "authenticity": 0.9
  },
  "human_score": 88
}`;
}

export function buildRewritePrompt(
  content: string,
  action: string,
  customInstruction?: string,
): string {
  const actionMap: Record<string, string> = {
    shorten: "Make it shorter and punchier. Cut unnecessary words. Max 200 chars.",
    expand: "Expand with more detail or context. Keep it under 280 chars.",
    punchier: "Make it more provocative and attention-grabbing. Add a strong hook.",
    professional: "Make it more polished and professional while keeping authenticity.",
    casual: "Make it more casual and conversational. Like talking to a friend.",
    add_data: "Add specific numbers, stats, or data points to make it more credible.",
  };

  const instruction = customInstruction || actionMap[action] || action;

  return `Rewrite this tweet:

"${content}"

Instruction: ${instruction}

Requirements:
- Keep the core message
- Must still sound human and authentic
- Max 280 characters
- Return ONLY the rewritten tweet text, nothing else`;
}
