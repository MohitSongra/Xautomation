import Groq from "groq-sdk";

let client: Groq | null = null;

export function getGroqClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey });
  }
  return client;
}

export async function generateWithGroq(prompt: string, systemPrompt?: string): Promise<string> {
  const groq = getGroqClient();
  const messages: { role: "system" | "user"; content: string }[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.8,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "";
}
