import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TwitterClient } from "@/lib/twitter/client";
import { decryptTwitterCookies } from "@/lib/security/x-cookies";

type ScheduledPostRow = {
  id: string;
  user_id: string;
  content: string | null;
  tweet_drafts?: {
    tweet_type?: string;
    thread_content?: string[];
  } | null;
  profiles?: {
    x_cookies?: unknown;
  } | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

// This runs on Vercel's edge network or node runtime via cron
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron authentication
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Initialize Supabase service role client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase service key not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Fetch pending scheduled posts
    const { data: posts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("*, tweet_drafts(tweet_type, thread_content), profiles(x_cookies)")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString());

    if (fetchError) {
      console.error("Failed to fetch scheduled posts:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: "No posts to schedule" });
    }

    const results = [];
    const twitterClient = new TwitterClient();
    const duePosts = posts as ScheduledPostRow[];

    // 4. Process each post
    for (const post of duePosts) {
      try {
        const cookies = decryptTwitterCookies(post.profiles?.x_cookies);

        const content = post.content;
        if (!content) {
          throw new Error("Missing draft content");
        }
        
        // Initialize TwitterClient with user cookies
        await twitterClient.setCookies(cookies);
        
        const isThread = post.tweet_drafts?.tweet_type === "thread" && 
          Array.isArray(post.tweet_drafts?.thread_content) && 
          post.tweet_drafts.thread_content.length > 0;
          
        // Publish
        let res;
        if (isThread) {
          res = await twitterClient.publishThread(post.tweet_drafts!.thread_content!);
        } else {
          res = await twitterClient.publishTweet(content);
        }

        if (res.success) {
          // Update status to published
          await supabase
            .from("scheduled_posts")
            .update({ status: "published" })
            .eq("id", post.id);

          // Log to published_posts
          await supabase.from("published_posts").insert({
            user_id: post.user_id,
            scheduled_post_id: post.id,
            x_tweet_id: res.tweetId || `unknown-${Date.now()}`,
            content: content,
            tweet_type: isThread ? "thread" : "tweet",
            published_at: new Date().toISOString(),
            raw_response: res.rawResponse || {}
          });
          
          results.push({ id: post.id, status: "success", tweetId: res.tweetId });
        } else {
          throw new Error(res.error || "Twitter API returned false");
        }
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
        console.error(`Failed to post scheduled post ${post.id}:`, err);
        // Update status to failed
        await supabase
          .from("scheduled_posts")
          .update({ 
            status: "failed", 
            error_message: errorMessage 
          })
          .eq("id", post.id);
          
        results.push({ id: post.id, status: "failed", error: errorMessage });
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Cron handler error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
