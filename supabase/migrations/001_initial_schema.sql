-- ============================================
-- Xautomation Database Schema (Phase 1 MVP)
-- Run this in your Supabase SQL editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- Users (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  x_username TEXT,
  x_user_id TEXT,
  x_cookies JSONB DEFAULT '{}'::JSONB,
  x_connected BOOLEAN DEFAULT FALSE,
  persona_config JSONB DEFAULT '{
    "tone": "intelligent, concise, technical",
    "topics": ["AI", "coding", "startups"],
    "avoid": ["cringe AI phrases", "excessive emojis"],
    "voice_notes": ""
  }'::JSONB,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tweet Ideas
-- ============================================
CREATE TABLE IF NOT EXISTS public.tweet_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  virality_score INTEGER DEFAULT 0 CHECK (virality_score >= 0 AND virality_score <= 100),
  engagement_prediction INTEGER DEFAULT 0 CHECK (engagement_prediction >= 0 AND engagement_prediction <= 100),
  reasoning TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'selected', 'drafted', 'archived', 'dismissed')),
  source_type TEXT DEFAULT 'ai' CHECK (source_type IN ('ai', 'manual', 'trending', 'curated')),
  source_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tweet Drafts
-- ============================================
CREATE TABLE IF NOT EXISTS public.tweet_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.tweet_ideas(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tweet_type TEXT DEFAULT 'tweet' CHECK (tweet_type IN ('tweet', 'thread', 'quote', 'reply')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'approved', 'scheduled', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  edit_history JSONB DEFAULT '[]'::JSONB,
  human_score INTEGER DEFAULT 0 CHECK (human_score >= 0 AND human_score <= 100),
  safety_flags JSONB DEFAULT '{"is_duplicate": false, "is_spam": false, "ai_tone_detected": false, "repetitive_phrases": [], "warnings": []}'::JSONB,
  tone_analysis JSONB DEFAULT '{}'::JSONB,
  thread_content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Scheduled Posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  draft_id UUID NOT NULL REFERENCES public.tweet_drafts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'publishing', 'published', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Published Posts
-- ============================================
CREATE TABLE IF NOT EXISTS public.published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id),
  x_tweet_id TEXT NOT NULL,
  content TEXT NOT NULL,
  tweet_type TEXT DEFAULT 'tweet',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  raw_response JSONB DEFAULT '{}'::JSONB
);

-- ============================================
-- Post Analytics
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_post_id UUID NOT NULL REFERENCES public.published_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  quotes INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Persona Memory (pgvector RAG)
-- ============================================
CREATE TABLE IF NOT EXISTS public.persona_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN (
    'published_tweet', 'writing_style', 'topic_preference',
    'vocabulary', 'opinion', 'project_note', 'successful_tweet'
  )),
  content TEXT NOT NULL,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}'::JSONB,
  relevance_score NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Content Sources
-- ============================================
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('hackernews', 'github', 'devto', 'reddit', 'rss', 'custom')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::JSONB,
  last_fetched TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Trending Items
-- ============================================
CREATE TABLE IF NOT EXISTS public.trending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.content_sources(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  summary TEXT,
  source_type TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  used BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Activity Log
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ideas_user_status ON public.tweet_ideas(user_id, status);
CREATE INDEX IF NOT EXISTS idx_drafts_user_status ON public.tweet_drafts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_status ON public.scheduled_posts(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_published_user ON public.published_posts(user_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON public.post_analytics(published_post_id);
CREATE INDEX IF NOT EXISTS idx_memory_user_type ON public.persona_memory(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_trending_user ON public.trending_items(user_id, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_log(user_id, created_at DESC);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_memory_embedding ON public.persona_memory
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tweet_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persona_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- All other tables: user can CRUD their own data
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'tweet_ideas', 'tweet_drafts', 'scheduled_posts', 'published_posts',
    'post_analytics', 'persona_memory', 'content_sources', 'trending_items', 'activity_log'
  ]) LOOP
    EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Users can delete own %s" ON public.%I FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
  END LOOP;
END $$;

-- ============================================
-- Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_drafts_updated_at
  BEFORE UPDATE ON public.tweet_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
