import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TwitterClient } from "@/lib/twitter/client";
import { decryptTwitterCookies } from "@/lib/security/x-cookies";

type PublishedPostRow = {
  id: string;
  user_id: string;
  x_tweet_id: string;
  profiles?: {
    x_cookies?: unknown;
  } | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

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

    // 2. Initialize Supabase service role client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Fetch recent published posts (last 30 days) that have an x_tweet_id
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: publishedPosts, error: fetchError } = await supabase
      .from("published_posts")
      .select("*, profiles(x_cookies)")
      .not("x_tweet_id", "is", null)
      .not("x_tweet_id", "like", "unknown-%") // Skip mocked/failed IDs
      .gte("published_at", thirtyDaysAgo.toISOString())
      .order("published_at", { ascending: false });

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    if (!publishedPosts || publishedPosts.length === 0) {
      return NextResponse.json({ message: "No posts to analyze" });
    }

    const results = [];
    const postsToAnalyze = publishedPosts as PublishedPostRow[];
    
    // Group posts by user to minimize cookie setting overhead
    const postsByUser: Record<string, PublishedPostRow[]> = {};
    for (const post of postsToAnalyze) {
      if (!postsByUser[post.user_id]) postsByUser[post.user_id] = [];
      postsByUser[post.user_id].push(post);
    }

    // 4. Process analytics per user
    for (const userId of Object.keys(postsByUser)) {
      const posts = postsByUser[userId];
      let cookies;

      try {
        cookies = decryptTwitterCookies(posts[0].profiles?.x_cookies);
      } catch (err: unknown) {
        console.log(`Skipping user ${userId}: ${getErrorMessage(err)}`);
        continue;
      }

      const twitterClient = new TwitterClient();
      try {
        await twitterClient.setCookies(cookies);
        
        for (const post of posts) {
          const res = await twitterClient.getTweetStats(post.x_tweet_id);
          if (res.success && res.stats) {
            // Upsert into post_analytics
            const engagementRate = (res.stats.likes + res.stats.reposts + res.stats.replies) / 
              (res.stats.impressions || 1) * 100;
              
            await supabase.from("post_analytics").upsert({
              published_post_id: post.id,
              user_id: post.user_id,
              likes: res.stats.likes,
              reposts: res.stats.reposts,
              replies: res.stats.replies,
              impressions: res.stats.impressions,
              quotes: res.stats.quotes,
              engagement_rate: parseFloat(engagementRate.toFixed(2)),
              fetched_at: new Date().toISOString()
            }, { onConflict: "published_post_id" });
            
            results.push({ tweetId: post.x_tweet_id, status: "updated", stats: res.stats });
          } else {
            console.error(`Failed to fetch stats for ${post.x_tweet_id}:`, res.error);
            results.push({ tweetId: post.x_tweet_id, status: "failed", error: res.error });
          }
          
          // Slight delay to avoid rate limiting
          await new Promise(r => setTimeout(r, 500));
        }
      } catch (err: unknown) {
        console.error(`Error processing analytics for user ${userId}:`, err);
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error("Analytics Cron error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
