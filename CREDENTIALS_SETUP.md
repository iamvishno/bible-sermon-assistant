# Credentials Setup Guide

This guide will walk you through setting up all external services and getting the credentials you need.

**Estimated Time**: 30-45 minutes
**Cost**: $0 (all free tiers)

---

## Overview - What You Need

| Service | Purpose | Cost | Time |
|---------|---------|------|------|
| Supabase | Database + Auth | Free | 15 min |
| Upstash Redis | AI Response Cache | Free | 10 min |
| OpenAI | AI Sermon Generation | Pay-as-you-go | 5 min |
| eBible.org | Telugu Bible Data | Free | 10 min |

---

## 1. Supabase Setup (15 minutes)

### Step 1.1: Create Account
1. Go to https://supabase.com
2. Click **Start your project**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 1.2: Create Project
1. Click **New Project**
2. Fill in:
   - **Name**: `bible-sermon-assistant`
   - **Database Password**: Click "Generate password" and SAVE IT!
   - **Region**: `ap-south-1` (India) or closest to you
   - **Pricing Plan**: Free
3. Click **Create new project**
4. Wait 2-3 minutes for initialization

### Step 1.3: Run Database Migration
1. In your Supabase project dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open this file on your computer:
   ```
   BibleSermonAssistant/backend/migrations/001_initial_schema.sql
   ```
4. Copy ALL contents (Ctrl+A, Ctrl+C)
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success" message (should take 5-10 seconds)
8. You should see: "Bible Sermon Assistant database schema created successfully!"

### Step 1.4: Get API Credentials
1. Go to **Settings** (left sidebar) → **API**
2. You'll see these values - **COPY THEM NOW**:

```bash
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...
```

3. Go to **Settings** → **Database** → **Connection string**
4. Copy the **JWT Secret**:
```bash
JWT Secret: your-super-secret-jwt-token-here
```

### Step 1.5: Configure Your .env Files

**Mobile App** (`BibleSermonAssistant/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`BibleSermonAssistant/backend/.env`):
```env
# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-here
```

### Step 1.6: Optional - Set Up Cron Jobs
1. Go to **Database** → **Extensions**
2. Enable **pg_cron**
3. Go back to **SQL Editor**
4. Run this query:

```sql
-- Reset monthly AI quotas (runs 1st of each month at midnight)
SELECT cron.schedule(
    'reset-monthly-quotas',
    '0 0 1 * *',
    $$SELECT reset_monthly_quotas()$$
);

-- Clean up expired cache (runs daily at 2 AM)
SELECT cron.schedule(
    'cleanup-expired-cache',
    '0 2 * * *',
    $$SELECT cleanup_expired_cache()$$
);
```

✅ **Supabase Setup Complete!**

---

## 2. Upstash Redis Setup (10 minutes)

### Step 2.1: Create Account
1. Go to https://upstash.com
2. Click **Get Started**
3. Sign up with GitHub, Google, or email
4. Verify your email

### Step 2.2: Create Redis Database
1. Click **Create Database**
2. Fill in:
   - **Name**: `bible-sermon-cache`
   - **Type**: **Regional**
   - **Region**: Choose closest to your target users (e.g., `ap-south-1` for India)
   - **Eviction**: **allkeys-lru** (removes least recently used)
   - **TLS**: Enabled (default)
3. Click **Create**

### Step 2.3: Get Connection URL
1. You'll see your database dashboard
2. Scroll down to **REST API** section
3. Copy the **UPSTASH_REDIS_REST_URL**:
```bash
UPSTASH_REDIS_REST_URL: https://xxxxxxxxx.upstash.io
```

### Step 2.4: Configure Backend .env
Add to `BibleSermonAssistant/backend/.env`:
```env
# Redis Configuration
REDIS_URL=https://default:xxxxxx@xxxxxxxxx.upstash.io
```

**Note**: Use the full REST URL with authentication included

✅ **Redis Setup Complete!**

---

## 3. OpenAI API Setup (5 minutes)

### Step 3.1: Create Account
1. Go to https://platform.openai.com
2. Click **Sign up**
3. Sign up with Google, Microsoft, or email
4. Verify your email

### Step 3.2: Add Payment Method
1. Go to **Settings** → **Billing**
2. Click **Add payment method**
3. Add credit/debit card
4. Set spending limit (recommend $10/month to start)

### Step 3.3: Create API Key
1. Go to **API keys** (left sidebar)
2. Click **Create new secret key**
3. Give it a name: `bible-sermon-assistant`
4. Click **Create secret key**
5. **COPY THE KEY NOW** - you won't see it again!
```bash
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3.4: Configure Backend .env
Add to `BibleSermonAssistant/backend/.env`:
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_ORG_ID=  # Optional, leave empty
DEFAULT_MODEL=gpt-3.5-turbo
PREMIUM_MODEL=gpt-4
MAX_TOKENS_INPUT=500
MAX_TOKENS_OUTPUT=1500
```

### Step 3.5: Monitor Usage
1. Go to **Usage** (left sidebar)
2. Check your daily/monthly usage
3. Set up usage alerts if available

**Expected costs during development**: $5-10/month
**Expected costs in production** (with 80% cache hit): $10-50/month

✅ **OpenAI Setup Complete!**

---

## 4. Telugu Bible Data (10 minutes)

### Step 4.1: Download from eBible.org
1. Go to https://ebible.org/find/details.php?id=tel
2. Scroll down to **Downloads** section
3. Click **USFM** format download link
4. Save the ZIP file

### Step 4.2: Extract Files
1. Extract the ZIP file
2. You'll get a folder with `.usfm` files
3. Create this folder structure:
```
BibleSermonAssistant/
└── data/
    └── usfm/
        ├── 01-GENtel.usfm
        ├── 02-EXOtel.usfm
        ├── ... (all 66 books)
```

### Step 4.3: Parse and Create Database
Open terminal in `BibleSermonAssistant` directory:

```bash
# Parse USFM files to JSON
python scripts/parse_usfm.py

# This will create: data/telugu_bible.json
# Should see: "✅ Saved to data/telugu_bible.json"

# Create SQLite database
python scripts/create_bible_db.py

# This will create: assets/bible.db
# Should see: "✅ Database created successfully: assets/bible.db"
```

### Step 4.4: Verify Database
Check that `assets/bible.db` exists and is 8-12 MB in size.

✅ **Bible Data Setup Complete!**

---

## 5. Final .env Configuration

### Mobile App `.env`
Create `BibleSermonAssistant/.env`:
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
EXPO_PUBLIC_API_URL=http://localhost:8000

# Google Sign-In (Optional - for later)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=

# Environment
EXPO_PUBLIC_ENV=development
```

### Backend `.env`
Create `BibleSermonAssistant/backend/.env`:
```env
# FastAPI Configuration
APP_NAME=Bible Sermon Assistant API
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-here

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_ORG_ID=
DEFAULT_MODEL=gpt-3.5-turbo
PREMIUM_MODEL=gpt-4
MAX_TOKENS_INPUT=500
MAX_TOKENS_OUTPUT=1500

# Redis (Upstash)
REDIS_URL=https://default:xxxxxx@xxxxxxxxx.upstash.io

# AI Cost Management
DAILY_SPEND_LIMIT=10.00
CACHE_TTL_DAYS=7
TARGET_CACHE_HIT_RATE=0.80

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081

# Security
SECRET_KEY=your-secret-key-for-jwt-signing-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Play (Leave empty for now)
GOOGLE_PLAY_SERVICE_ACCOUNT_FILE=
GOOGLE_PLAY_PACKAGE_NAME=com.biblesermonassistant.app

# Razorpay (Leave empty for now)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 6. Verification Checklist

Before proceeding, verify:

### Supabase
- [ ] Project created
- [ ] Database schema migrated (8 tables created)
- [ ] URL copied to both .env files
- [ ] anon key copied to mobile .env
- [ ] service_role key copied to backend .env
- [ ] JWT secret copied to backend .env

### Redis
- [ ] Database created on Upstash
- [ ] Connection URL copied to backend .env
- [ ] Can see dashboard (shows 0 keys initially)

### OpenAI
- [ ] Account created
- [ ] Payment method added
- [ ] API key created and copied
- [ ] Usage monitoring enabled

### Bible Data
- [ ] USFM files downloaded
- [ ] Files extracted to data/usfm/
- [ ] parse_usfm.py executed successfully
- [ ] create_bible_db.py executed successfully
- [ ] assets/bible.db exists (8-12 MB)

### .env Files
- [ ] Mobile .env created with all values
- [ ] Backend .env created with all values
- [ ] No placeholder values left (xxxxx)
- [ ] Both files added to .gitignore

---

## 7. Test Your Setup

### Test Backend
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python app/main.py
```

Visit http://localhost:8000/health - should see:
```json
{
  "status": "healthy",
  "service": "Bible Sermon Assistant API",
  "version": "1.0.0"
}
```

### Test Mobile App
```bash
cd BibleSermonAssistant
npm install
npm start
```

Press `a` for Android or `i` for iOS.

App should:
1. Show Auth screen (Sign In/Sign Up)
2. You can "Continue as Guest"
3. See Bible book list
4. Tap a book to read verses

---

## 8. Troubleshooting

### Supabase Migration Fails
**Error**: "relation already exists"
- **Fix**: Schema already created, safe to ignore OR drop all tables and re-run

**Error**: "permission denied"
- **Fix**: Make sure you're logged in and using the correct project

### Redis Connection Fails
**Error**: "connection refused"
- **Fix**: Check REDIS_URL format includes authentication
- **Format**: `https://default:password@host.upstash.io`

### OpenAI API Errors
**Error**: "Invalid API key"
- **Fix**: Re-copy key from OpenAI dashboard, ensure no extra spaces

**Error**: "Insufficient quota"
- **Fix**: Add payment method in OpenAI billing settings

### Bible Database Missing
**Error**: "Cannot find module './assets/bible.db'"
- **Fix**: Run `python scripts/create_bible_db.py`
- **Verify**: Check file exists and is 8-12 MB

### Mobile App Won't Start
**Error**: "Supabase URL not configured"
- **Fix**: Check .env file exists in project root
- **Verify**: Run `expo start -c` to clear cache

---

## 9. Security Best Practices

### ✅ DO:
- Use environment variables for all credentials
- Add .env to .gitignore
- Use different keys for development/production
- Rotate keys periodically
- Monitor usage dashboards

### ❌ DON'T:
- Commit .env files to Git
- Share service_role keys
- Use production keys in development
- Hardcode API keys in code
- Share API keys publicly

---

## 10. Cost Monitoring

### Supabase (Free Tier Limits)
- Database: 500 MB
- Auth Users: 50,000
- Storage: 1 GB
- **Monitor**: Settings → Usage

### Upstash Redis (Free Tier)
- Max 10,000 commands/day
- 256 MB storage
- **Monitor**: Dashboard shows command count

### OpenAI
- Pay per API call
- GPT-3.5: ~$0.002 per sermon
- GPT-4: ~$0.06 per sermon
- **Monitor**: platform.openai.com/usage

**Set spending limits in all services!**

---

## 11. What's Next?

Once all credentials are configured:

1. **Test the app**:
   ```bash
   npm start
   ```

2. **Test authentication**:
   - Sign up with email
   - Verify auto-created profile
   - Check Supabase dashboard → Authentication → Users

3. **Continue development**:
   - See NEXT_STEPS.md for Task #8 (Sync Service)
   - Ready for Task #10 (AI Sermon Generation)

---

## Need Help?

- **Supabase**: https://supabase.com/docs
- **Upstash**: https://docs.upstash.com/redis
- **OpenAI**: https://platform.openai.com/docs
- **eBible**: https://ebible.org/

---

**Setup Status**: ⏳ Waiting for credentials
**Next**: Complete this guide, then run the app!
