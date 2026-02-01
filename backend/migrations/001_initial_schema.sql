-- Bible Sermon Assistant - Initial Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'ministry')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
    ai_quota_monthly INTEGER NOT NULL DEFAULT 3,
    ai_quota_used INTEGER NOT NULL DEFAULT 0,
    ai_quota_reset_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    preferences JSONB NOT NULL DEFAULT '{
        "theme": "auto",
        "font_size": 16,
        "language": "telugu",
        "default_sermon_type": null,
        "default_audience": null
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on subscription_tier for filtering
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Sermons Table
CREATE TABLE sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    source_verses JSONB NOT NULL,
    sermon_type TEXT NOT NULL CHECK (sermon_type IN ('expository', 'topical', 'narrative', 'devotional')),
    target_audience TEXT NOT NULL CHECK (target_audience IN ('general', 'youth', 'children', 'adults', 'seniors')),
    language TEXT NOT NULL DEFAULT 'telugu',
    ai_model_used TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for sermons
CREATE INDEX idx_sermons_user_id ON sermons(user_id);
CREATE INDEX idx_sermons_created_at ON sermons(created_at DESC);
CREATE INDEX idx_sermons_sermon_type ON sermons(sermon_type);
CREATE INDEX idx_sermons_tags ON sermons USING GIN(tags);

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'ministry')),
    platform TEXT NOT NULL CHECK (platform IN ('google_play', 'razorpay')),
    platform_subscription_id TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, platform_subscription_id)
);

-- Create indexes for subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at);

-- Bookmarks Table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    note TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter, verse)
);

-- Create indexes for bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_book_chapter ON bookmarks(book_id, chapter);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Highlights Table
CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER NOT NULL,
    color TEXT NOT NULL DEFAULT '#FFEB3B',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for highlights
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_book_chapter ON highlights(book_id, chapter);

-- Verse Notes Table
CREATE TABLE verse_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id, chapter, verse)
);

-- Create indexes for verse notes
CREATE INDEX idx_verse_notes_user_id ON verse_notes(user_id);
CREATE INDEX idx_verse_notes_book_chapter ON verse_notes(book_id, chapter);

-- AI Cache Table (shared across users)
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    request_type TEXT NOT NULL,
    source_verses JSONB NOT NULL,
    config JSONB NOT NULL,
    response_content JSONB NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for AI cache
CREATE INDEX idx_ai_cache_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires_at ON ai_cache(expires_at);
CREATE INDEX idx_ai_cache_hit_count ON ai_cache(hit_count DESC);

-- Sync Operations Table (for conflict resolution)
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('sermon', 'bookmark', 'highlight', 'note')),
    entity_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    payload JSONB NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for sync operations
CREATE INDEX idx_sync_operations_user_id ON sync_operations(user_id);
CREATE INDEX idx_sync_operations_processed ON sync_operations(processed);
CREATE INDEX idx_sync_operations_entity ON sync_operations(entity_type, entity_id);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_highlights_updated_at BEFORE UPDATE ON highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verse_notes_updated_at BEFORE UPDATE ON verse_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_cache_updated_at BEFORE UPDATE ON ai_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_operations ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Sermons Policies
CREATE POLICY "Users can view their own sermons"
    ON sermons FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sermons"
    ON sermons FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sermons"
    ON sermons FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sermons"
    ON sermons FOR DELETE
    USING (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Bookmarks Policies
CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
    ON bookmarks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- Highlights Policies
CREATE POLICY "Users can view their own highlights"
    ON highlights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own highlights"
    ON highlights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights"
    ON highlights FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
    ON highlights FOR DELETE
    USING (auth.uid() = user_id);

-- Verse Notes Policies
CREATE POLICY "Users can view their own verse notes"
    ON verse_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verse notes"
    ON verse_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verse notes"
    ON verse_notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verse notes"
    ON verse_notes FOR DELETE
    USING (auth.uid() = user_id);

-- Sync Operations Policies
CREATE POLICY "Users can view their own sync operations"
    ON sync_operations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync operations"
    ON sync_operations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, subscription_tier, subscription_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'User'),
        'free',
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to reset monthly AI quotas (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles
    SET
        ai_quota_used = 0,
        ai_quota_reset_at = NOW() + INTERVAL '1 month'
    WHERE ai_quota_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Clean up expired AI cache entries (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Bible Sermon Assistant database schema created successfully!';
    RAISE NOTICE 'Remember to:';
    RAISE NOTICE '1. Set up cron jobs for reset_monthly_quotas() and cleanup_expired_cache()';
    RAISE NOTICE '2. Configure auth providers in Supabase Dashboard';
    RAISE NOTICE '3. Update environment variables with Supabase URL and keys';
END $$;
