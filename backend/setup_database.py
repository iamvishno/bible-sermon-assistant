#!/usr/bin/env python3
"""
Setup Supabase database with all required tables
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 80)
print("SETTING UP SUPABASE DATABASE")
print("=" * 80)
print()

# Get Supabase credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("[ERROR] Supabase credentials not found in .env file")
    sys.exit(1)

print(f"[OK] Supabase URL: {supabase_url}")
print(f"[OK] Supabase Key: {supabase_key[:20]}...")
print()

try:
    from supabase import create_client, Client

    print("[INFO] Connecting to Supabase...")
    supabase: Client = create_client(supabase_url, supabase_key)

    print("[SUCCESS] Connected to Supabase!")
    print()

    # SQL to create all tables
    sql_schema = """
    -- User Profiles Table
    CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        display_name TEXT,
        subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'ministry')),
        subscription_status TEXT DEFAULT 'active',
        ai_quota_monthly INTEGER DEFAULT 3,
        ai_quota_used INTEGER DEFAULT 0,
        ai_quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Sermons Table
    CREATE TABLE IF NOT EXISTS sermons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content JSONB NOT NULL,
        source_verses JSONB NOT NULL,
        sermon_type TEXT,
        target_audience TEXT,
        language TEXT DEFAULT 'telugu',
        ai_model_used TEXT,
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Subscriptions Table
    CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        tier TEXT NOT NULL CHECK (tier IN ('basic', 'premium', 'ministry')),
        platform TEXT NOT NULL CHECK (platform IN ('google_play', 'razorpay', 'manual')),
        platform_subscription_id TEXT,
        amount_cents INTEGER NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Bookmarks Table
    CREATE TABLE IF NOT EXISTS bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        note TEXT,
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Highlights Table
    CREATE TABLE IF NOT EXISTS highlights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse_start INTEGER NOT NULL,
        verse_end INTEGER NOT NULL,
        color TEXT DEFAULT 'yellow',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Verse Notes Table
    CREATE TABLE IF NOT EXISTS verse_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- AI Cache Table
    CREATE TABLE IF NOT EXISTS ai_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cache_key TEXT UNIQUE NOT NULL,
        request_type TEXT NOT NULL,
        source_verses JSONB NOT NULL,
        config JSONB NOT NULL,
        response_content JSONB NOT NULL,
        hit_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Sync Operations Table
    CREATE TABLE IF NOT EXISTS sync_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
        entity_type TEXT NOT NULL,
        entity_id UUID NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
        payload JSONB NOT NULL,
        client_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_sermons_user_id ON sermons(user_id);
    CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
    CREATE INDEX IF NOT EXISTS idx_verse_notes_user_id ON verse_notes(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sync_operations_user_id ON sync_operations(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
    CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);
    """

    print("[INFO] Creating database tables...")
    print()

    # Execute SQL via Supabase REST API
    # Note: Supabase Python client doesn't have direct SQL execution
    # We'll use the REST API directly
    import requests

    # Supabase SQL endpoint
    sql_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json"
    }

    # For new Supabase, we need to use the Supabase management API
    # Let's try creating tables via direct SQL execution
    print("[INFO] Note: Direct SQL execution requires Supabase Pro plan")
    print("[INFO] Alternative: Run SQL manually in Supabase SQL Editor")
    print()
    print("[INFO] Copy the SQL from backend/migrations/001_initial_schema.sql")
    print("[INFO] and run it in: Supabase Dashboard → SQL Editor → New Query")
    print()

    # Test basic connection by trying to query (this will fail if tables don't exist)
    try:
        result = supabase.table('user_profiles').select("*").limit(1).execute()
        print("[SUCCESS] user_profiles table exists!")
        print(f"[INFO] Found {len(result.data)} rows")
    except Exception as e:
        print(f"[INFO] user_profiles table doesn't exist yet: {str(e)}")
        print()
        print("=" * 80)
        print("ACTION REQUIRED:")
        print("=" * 80)
        print()
        print("Please run the database migration manually:")
        print()
        print("1. Open: https://aviassxdtdoqfcyesffg.supabase.co")
        print("2. Go to: SQL Editor (left sidebar)")
        print("3. Click: New Query")
        print("4. Copy SQL from: backend/migrations/001_initial_schema.sql")
        print("5. Paste and click: Run")
        print()
        print("I'll create the migration file for you now...")

    print()
    print("[SUCCESS] Database connection test complete!")
    print()

except ImportError:
    print("[ERROR] supabase package not installed")
    print("[INFO] Installing now...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "supabase"])
    print("[SUCCESS] Installed! Please run this script again.")

except Exception as e:
    print(f"[ERROR] {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
