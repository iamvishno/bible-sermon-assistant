# What You Need to Provide - Quick Reference

**Time Required**: 30-45 minutes
**Cost**: $0 (all free tiers)
**Detailed Guide**: See `CREDENTIALS_SETUP.md`

---

## Summary - 4 Things to Set Up

| # | Service | What to Get | Where to Put It | Time |
|---|---------|-------------|-----------------|------|
| 1 | Supabase | 3 credentials | Both .env files | 15 min |
| 2 | Upstash Redis | 1 URL | Backend .env | 10 min |
| 3 | OpenAI | 1 API key | Backend .env | 5 min |
| 4 | eBible.org | Bible data | Run 2 scripts | 10 min |

---

## 1. Supabase (3 Credentials)

### Create Account & Project
- Website: https://supabase.com
- Create new project
- Run SQL migration (copy from `backend/migrations/001_initial_schema.sql`)

### Get These 3 Values:
```
Settings → API:
1. Project URL: https://xxxxx.supabase.co
2. anon public key: eyJhbGci...
3. service_role key: eyJhbGci...

Settings → Database:
4. JWT Secret: super-secret-token
```

### Put Them Here:

**Mobile** (`BibleSermonAssistant/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Backend** (`BibleSermonAssistant/backend/.env`):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...  # service_role key
SUPABASE_JWT_SECRET=super-secret-token
```

---

## 2. Upstash Redis (1 URL)

### Create Account & Database
- Website: https://upstash.com
- Create database (Regional, allkeys-lru)

### Get This 1 Value:
```
Dashboard → REST API:
UPSTASH_REDIS_REST_URL: https://default:xxxxx@xxxxx.upstash.io
```

### Put It Here:

**Backend** (`BibleSermonAssistant/backend/.env`):
```env
REDIS_URL=https://default:xxxxx@xxxxx.upstash.io
```

---

## 3. OpenAI (1 API Key)

### Create Account & API Key
- Website: https://platform.openai.com
- Add payment method
- Create new API key

### Get This 1 Value:
```
API Keys → Create new key:
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Put It Here:

**Backend** (`BibleSermonAssistant/backend/.env`):
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. Telugu Bible Data (Run Scripts)

### Download & Process
1. Download USFM from https://ebible.org/find/details.php?id=tel
2. Extract to `data/usfm/`
3. Run scripts:

```bash
# Parse USFM to JSON
python scripts/parse_usfm.py

# Create SQLite database
python scripts/create_bible_db.py
```

### Verify:
```bash
# This file should exist and be 8-12 MB
ls -lh assets/bible.db
```

---

## Complete .env Templates

### Mobile App
**File**: `BibleSermonAssistant/.env`
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=       # From Supabase step
EXPO_PUBLIC_SUPABASE_ANON_KEY=  # From Supabase step

# Backend
EXPO_PUBLIC_API_URL=http://localhost:8000

# Environment
EXPO_PUBLIC_ENV=development
```

### Backend
**File**: `BibleSermonAssistant/backend/.env`
```env
# FastAPI
APP_NAME=Bible Sermon Assistant API
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000

# Supabase
SUPABASE_URL=              # From Supabase step
SUPABASE_KEY=              # From Supabase step (service_role)
SUPABASE_JWT_SECRET=       # From Supabase step

# OpenAI
OPENAI_API_KEY=            # From OpenAI step
DEFAULT_MODEL=gpt-3.5-turbo
PREMIUM_MODEL=gpt-4
MAX_TOKENS_INPUT=500
MAX_TOKENS_OUTPUT=1500

# Redis
REDIS_URL=                 # From Upstash step

# AI Cost Management
DAILY_SPEND_LIMIT=10.00
CACHE_TTL_DAYS=7
TARGET_CACHE_HIT_RATE=0.80

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:8081

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Leave empty for now
GOOGLE_PLAY_SERVICE_ACCOUNT_FILE=
GOOGLE_PLAY_PACKAGE_NAME=com.biblesermonassistant.app
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Quick Test

After setup, test:

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
python app/main.py

# Terminal 2: Start mobile app
npm start
```

Visit http://localhost:8000/health - should see JSON response

Press `a` in Expo terminal - should see Auth screen

---

## Checklist

Before saying "I'm done":

- [ ] Created Supabase project
- [ ] Ran SQL migration in Supabase
- [ ] Copied 3 Supabase values to .env files
- [ ] Created Upstash Redis database
- [ ] Copied Redis URL to backend .env
- [ ] Created OpenAI account
- [ ] Added payment method to OpenAI
- [ ] Created OpenAI API key
- [ ] Copied API key to backend .env
- [ ] Downloaded Telugu Bible USFM files
- [ ] Ran parse_usfm.py
- [ ] Ran create_bible_db.py
- [ ] Verified bible.db exists (8-12 MB)
- [ ] Created mobile .env with all values
- [ ] Created backend .env with all values
- [ ] No placeholder xxxxx left in files
- [ ] Backend starts without errors
- [ ] Mobile app starts without errors

---

## If You Get Stuck

**See detailed help in**: `CREDENTIALS_SETUP.md`

**Common issues**:
- "URL not configured" → Check .env file exists and has values
- "Connection failed" → Copy full URL including authentication
- "API key invalid" → Re-copy from dashboard, no spaces
- "Bible not found" → Run the two Python scripts

---

## After You're Done

**Tell me**:
1. "✅ All credentials configured, ready for next task"
2. Or "❌ Having issues with [service name]"

Then I'll continue with:
- Task #8: Sync Service
- Task #9: Verse Interactions
- Task #10-11: AI Sermon Generation (the main feature!)

---

## Alternative: Share Credentials Securely

If you prefer, you can:
1. Set up all accounts
2. Share credentials via encrypted message
3. I can configure .env files for you

**Never share credentials**:
- In plain text files
- In Git commits
- In screenshots
- In public messages

---

**Quick Reference Complete!**
**See CREDENTIALS_SETUP.md for full detailed guide.**
