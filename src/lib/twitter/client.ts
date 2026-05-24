import { Scraper } from "agent-twitter-client";

export type TwitterCookie =
  | string
  | {
      name?: string;
      value?: string;
      domain?: string;
      path?: string;
    };

type TweetCreateResponse = {
  data?: {
    create_tweet?: {
      tweet_results?: {
        result?: {
          rest_id?: string;
        };
      };
    };
  };
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export class TwitterClient {
  private scraper: Scraper;

  constructor() {
    this.scraper = new Scraper();
  }

  /**
   * Initialize the scraper with an array of cookies.
   */
  async setCookies(cookies: TwitterCookie[]) {
    // agent-twitter-client expects strings in the form of "key=value; domain=..."
    // If the database stores them as an array of objects (like EditThisCookie format),
    // we convert them to strings.
    const cookieStrings = cookies.map((c) => {
      if (typeof c === "string") return c;
      return `${c.name ?? ""}=${c.value ?? ""}; Domain=${c.domain ?? ""}; Path=${c.path || "/"}`;
    });
    
    await this.scraper.setCookies(cookieStrings);
  }

  /**
   * Publish a standard tweet or thread
   */
  async publishTweet(content: string, replyToTweetId?: string) {
    try {
      // The sendTweet method accepts the content, and optionally a replyToId.
      const response = await this.scraper.sendTweet(content, replyToTweetId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Twitter API Error: ${response.status} ${errorText}`);
      }

      // Twitter's internal API returns a JSON response containing the newly created tweet data
      const data = (await response.json()) as TweetCreateResponse;
      
      // Attempt to parse out the new tweet ID from the GraphQL response
      // Structure usually: data.data.create_tweet.tweet_results.result.rest_id
      const tweetId = data?.data?.create_tweet?.tweet_results?.result?.rest_id || null;
      
      return {
        success: true,
        tweetId,
        rawResponse: data
      };
    } catch (error: unknown) {
      console.error("Failed to publish tweet:", error);
      return {
        success: false,
        error: getErrorMessage(
          error,
          "Unknown error occurred while publishing tweet"
        )
      };
    }
  }

  /**
   * Fetch engagement stats for a given tweet ID
   */
  async getTweetStats(tweetId: string) {
    try {
      const tweet = await this.scraper.getTweet(tweetId);
      if (!tweet) throw new Error("Tweet not found");
      
      return {
        success: true,
        stats: {
          likes: tweet.likes || 0,
          reposts: tweet.retweets || 0,
          replies: tweet.replies || 0,
          impressions: tweet.views || 0,
          quotes: (tweet as typeof tweet & { quotes?: number }).quotes || 0,
        }
      };
    } catch (error: unknown) {
      console.error("Failed to fetch tweet stats:", error);
      return {
        success: false,
        error: getErrorMessage(
          error,
          "Unknown error occurred while fetching tweet stats"
        )
      };
    }
  }
}
