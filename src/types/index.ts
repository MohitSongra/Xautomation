// ============================================
// Xautomation - TypeScript Type Definitions
// ============================================

// --- Database Types ---

export type TweetStatus = "draft" | "reviewing" | "approved" | "scheduled" | "published" | "archived";
export type IdeaStatus = "new" | "selected" | "drafted" | "archived" | "dismissed";
export type TweetType = "tweet" | "thread" | "quote" | "reply";
export type SourceType = "ai" | "manual" | "trending" | "curated";
export type ContentSourceType = "hackernews" | "github" | "devto" | "reddit" | "rss" | "custom";
export type MemoryType =
  | "published_tweet"
  | "writing_style"
  | "topic_preference"
  | "vocabulary"
  | "opinion"
  | "project_note"
  | "successful_tweet";

export type ScheduledPostStatus = "pending" | "publishing" | "published" | "failed" | "cancelled";

export interface User {
  id: string;
  email: string;
  display_name: string | null;
  x_username: string | null;
  x_user_id: string | null;
  x_cookies: unknown;
  x_connected: boolean;
  persona_config: PersonaConfig;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PersonaConfig {
  tone: string;
  topics: string[];
  avoid: string[];
  voice_notes: string;
}

export interface TweetIdea {
  id: string;
  user_id: string;
  content: string;
  category: string;
  virality_score: number;
  engagement_prediction: number;
  reasoning: string | null;
  status: IdeaStatus;
  source_type: SourceType;
  source_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TweetDraft {
  id: string;
  user_id: string;
  idea_id: string | null;
  content: string;
  tweet_type: TweetType;
  status: TweetStatus;
  version: number;
  edit_history: EditHistoryEntry[];
  human_score: number;
  safety_flags: SafetyFlags;
  tone_analysis: Record<string, unknown>;
  thread_content: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface EditHistoryEntry {
  content: string;
  edited_at: string;
  version: number;
  action: string;
}

export interface SafetyFlags {
  is_duplicate: boolean;
  is_spam: boolean;
  ai_tone_detected: boolean;
  repetitive_phrases: string[];
  warnings: string[];
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  draft_id: string;
  content: string;
  scheduled_for: string;
  timezone: string;
  status: ScheduledPostStatus;
  retry_count: number;
  error_message: string | null;
  created_at: string;
}

export interface PublishedPost {
  id: string;
  user_id: string;
  scheduled_post_id: string | null;
  x_tweet_id: string;
  content: string;
  tweet_type: TweetType;
  published_at: string;
  raw_response: Record<string, unknown>;
}

export interface PostAnalytics {
  id: string;
  published_post_id: string;
  user_id: string;
  likes: number;
  reposts: number;
  replies: number;
  impressions: number;
  quotes: number;
  bookmarks: number;
  engagement_rate: number;
  fetched_at: string;
}

export interface PersonaMemory {
  id: string;
  user_id: string;
  memory_type: MemoryType;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  relevance_score: number;
  created_at: string;
}

export interface ContentSource {
  id: string;
  user_id: string;
  source_type: ContentSourceType;
  source_name: string;
  source_url: string | null;
  is_active: boolean;
  config: Record<string, unknown>;
  last_fetched: string | null;
  created_at: string;
}

export interface TrendingItem {
  id: string;
  source_id: string | null;
  user_id: string;
  title: string;
  url: string | null;
  summary: string | null;
  source_type: string;
  score: number;
  metadata: Record<string, unknown>;
  used: boolean;
  fetched_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

// --- API Types ---

export interface GenerateIdeasRequest {
  categories?: string[];
  count?: number;
  trending_context?: string[];
}

export interface GenerateIdeasResponse {
  ideas: Omit<TweetIdea, "id" | "user_id" | "created_at">[];
}

export interface GenerateDraftRequest {
  idea_id: string;
  tweet_type?: TweetType;
  tone_override?: string;
}

export interface GenerateDraftResponse {
  draft: Omit<TweetDraft, "id" | "user_id" | "created_at" | "updated_at">;
}

export interface RewriteRequest {
  draft_id: string;
  action: "shorten" | "expand" | "punchier" | "professional" | "casual" | "add_data";
  custom_instruction?: string;
}

export interface RewriteResponse {
  content: string;
  changes_summary: string;
}

export interface ScheduleRequest {
  draft_id: string;
  scheduled_for: string;
  timezone?: string;
}

// --- AI Types ---

export interface AIGeneratedIdea {
  content: string;
  category: string;
  virality_score: number;
  engagement_prediction: number;
  reasoning: string;
}

export interface AIGeneratedDraft {
  content: string;
  tweet_type: TweetType;
  tone_analysis: {
    formality: number;
    technical_depth: number;
    humor: number;
    authenticity: number;
  };
  human_score: number;
  safety_flags?: SafetyFlags;
}

// --- Dashboard Stats ---

export interface DashboardStats {
  total_ideas: number;
  pending_drafts: number;
  published_posts: number;
  avg_engagement: number;
  ideas_today: number;
  scheduled_count: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}
