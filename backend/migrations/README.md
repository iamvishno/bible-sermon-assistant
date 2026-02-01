# Database Migrations

This directory contains SQL migration scripts for the Bible Sermon Assistant Supabase database.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Bible Sermon Assistant
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., ap-south-1 for India)
4. Click "Create new project"

### 2. Run Initial Schema Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `001_initial_schema.sql`
5. Paste into the query editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify success message appears

### 3. Set Up Cron Jobs

Supabase has a pg_cron extension for scheduled tasks. Set up these cron jobs:

#### Reset Monthly AI Quotas (runs on 1st of each month at midnight UTC)

```sql
SELECT cron.schedule(
    'reset-monthly-quotas',
    '0 0 1 * *',
    $$SELECT reset_monthly_quotas()$$
);
```

#### Clean Up Expired Cache (runs daily at 2 AM UTC)

```sql
SELECT cron.schedule(
    'cleanup-expired-cache',
    '0 2 * * *',
    $$SELECT cleanup_expired_cache()$$
);
```

To set up cron jobs:
1. Go to **Database** → **Extensions** in Supabase dashboard
2. Search for "pg_cron" and enable it
3. Go back to **SQL Editor**
4. Run the cron job setup queries above

### 4. Configure Authentication Providers

#### Email/Password Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password recovery email
   - Magic link email

#### Google Sign-In

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need to create a Google Cloud Project:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs from Supabase
4. Copy Client ID and Client Secret to Supabase dashboard

### 5. Get API Keys

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy these values to your `.env` files:
   - **Project URL**: `SUPABASE_URL`
   - **anon/public key**: `SUPABASE_ANON_KEY` (for mobile app)
   - **service_role key**: `SUPABASE_KEY` (for backend, keep secret!)
   - **JWT Secret**: `SUPABASE_JWT_SECRET` (for token validation)

### 6. Update Environment Variables

#### Mobile App (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Backend (.env)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

### 7. Test the Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- user_profiles
- sermons
- subscriptions
- bookmarks
- highlights
- verse_notes
- ai_cache
- sync_operations

### 8. Create Test User (Optional)

```sql
-- Insert a test user profile (after signing up via auth)
INSERT INTO user_profiles (id, display_name, subscription_tier, subscription_status, ai_quota_monthly)
VALUES (
    'your-user-id-from-auth-users-table',
    'Test User',
    'premium',
    'active',
    100
);
```

## Database Schema Overview

### Core Tables

- **user_profiles**: User account info, subscription tier, AI quota
- **sermons**: Generated sermons with content and metadata
- **subscriptions**: Subscription records and payment history
- **bookmarks**: User bookmarks with optional notes
- **highlights**: Highlighted verses with colors
- **verse_notes**: User notes on specific verses
- **ai_cache**: Cached AI responses (shared across users)
- **sync_operations**: Queue for client-server sync

### Key Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Automatic Timestamps**: `updated_at` auto-updates on row changes
- **Quota Management**: Automatic monthly quota reset via cron
- **Cache Cleanup**: Automatic deletion of expired AI cache
- **Auto Profile Creation**: User profile created automatically on signup

## Troubleshooting

### Migration fails with "extension uuid-ossp does not exist"

The uuid-ossp extension should be enabled by default in Supabase. If not:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### RLS policies blocking access

If you're testing with service_role key, RLS is bypassed. If using anon key, ensure:
1. User is authenticated (`auth.uid()` returns a value)
2. User profile exists in `user_profiles` table
3. RLS policies match your access pattern

### Cron jobs not running

1. Verify pg_cron extension is enabled
2. Check cron job logs:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## Migration History

- **001_initial_schema.sql**: Initial database setup (Sprint 0)
  - All core tables
  - RLS policies
  - Triggers and functions
  - Cron job functions

## Next Migrations

Future migrations will be numbered sequentially (002_, 003_, etc.) and should:
1. Be idempotent (safe to run multiple times)
2. Include rollback instructions
3. Update this README with migration notes
