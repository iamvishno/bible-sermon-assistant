# 🤖 Automated Setup Guide

**How to Let Me Help You Deploy Automatically**

This guide explains what you need to provide and what I can automate for you.

---

## ✅ What I Can Automate

| Task | Can Automate? | What I'll Do |
|------|---------------|--------------|
| **Environment Files** | ✅ Yes | Create `.env` files with your credentials |
| **Database Migrations** | ✅ Yes | Generate SQL and run migrations via Supabase API |
| **Backend Deployment** | ✅ Yes | Deploy to Railway using CLI |
| **Configuration Files** | ✅ Yes | Update `eas.json`, `app.json`, etc. |
| **Testing Connections** | ✅ Yes | Test all services are working |
| **Bible Data Download** | ✅ Yes | Download and parse Telugu Bible |
| **Build Commands** | ✅ Yes | Run build and test commands |

## ❌ What You Must Do Manually

| Task | Why Manual? | Time Needed |
|------|-------------|-------------|
| **Create Accounts** | Requires your email, payment info | 30-60 min |
| **Get API Keys** | You need to click "Create API Key" | 5 min per service |
| **App Assets (Icon/Graphics)** | Visual design requires your approval | 1-2 hours |
| **Screenshots** | Need to run app and capture screens | 30 min |
| **Privacy Policy Hosting** | Need your domain/GitHub account | 15 min |
| **Google Play Submission** | Final submission button must be clicked by you | 30 min |

---

## 📋 Step-by-Step Process

### Phase 1: Create Accounts (YOU DO THIS - 1 hour)

Do these steps first, then give me the credentials:

#### 1.1 Supabase Account

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub or email
3. Click "New Project"
4. Fill in:
   - **Name**: `bible-sermon-assistant`
   - **Database Password**: Click "Generate password" and **SAVE IT**
   - **Region**: Choose closest to you (e.g., "Asia Southeast (Mumbai)")
   - **Plan**: Free (for now, upgrade later)
5. Click "Create new project"
6. Wait 2 minutes for project to initialize
7. Once ready, go to **Settings → API**
8. Copy these 3 values:
   ```
   Project URL: https://xxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
9. Go to **Settings → Auth → JWT Secret**
10. Copy:
    ```
    JWT Secret: your-jwt-secret-here
    ```

**✅ What to give me**: Project URL, anon key, service_role key, JWT secret

---

#### 1.2 OpenAI Account

1. Go to https://platform.openai.com
2. Click "Sign up" (or sign in if you have account)
3. Go to **Billing** → Add payment method
4. Add credit card (they'll charge $5 minimum)
5. Set usage limits:
   - Soft limit: $30/month
   - Hard limit: $50/month
6. Go to **API Keys**
7. Click "Create new secret key"
8. Name it: `bible-sermon-assistant`
9. Copy the key (starts with `sk-...`)
   ```
   API Key: sk-proj-...
   ```

**⚠️ Important**: Save this key immediately! You can't see it again.

**✅ What to give me**: API key (sk-...)

---

#### 1.3 Upstash Redis Account

1. Go to https://upstash.com
2. Click "Sign up" → Use GitHub or email
3. Click "Create Database"
4. Fill in:
   - **Name**: `bible-sermon-cache`
   - **Type**: Regional
   - **Region**: Same as Supabase (e.g., Mumbai)
   - **Eviction**: No eviction
5. Click "Create"
6. Go to database → **Details** tab
7. Copy the **Redis URL**:
   ```
   Redis URL: redis://default:xxxxx@xxx.upstash.io:6379
   ```

**✅ What to give me**: Redis URL

---

#### 1.4 Railway Account

1. Go to https://railway.app
2. Click "Start a New Project" → Sign up with GitHub
3. Click "New Project" → "Empty Project"
4. Name it: `bible-sermon-backend`
5. Go to **Settings** → Copy:
   ```
   Project ID: xxx-xxx-xxx
   ```

**Note**: We'll deploy to this later using Railway CLI

**✅ What to give me**: Just confirm you created the project (I'll handle deployment)

---

#### 1.5 Google Play Console

**⚠️ This costs $25 one-time fee**

1. Go to https://play.google.com/console
2. Click "Create account"
3. Pay $25 registration fee
4. Complete identity verification (may take 24-48 hours)

**Note**: We'll set up the app listing later

**✅ What to give me**: Just confirm account is created and verified

---

### Phase 2: Give Me Your Credentials (COPY-PASTE - 5 min)

Once you have all the accounts set up, **copy this template** and fill in your values:

```
=== SUPABASE ===
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

=== OPENAI ===
OPENAI_API_KEY=sk-proj-...

=== REDIS ===
REDIS_URL=redis://default:xxxxx@xxx.upstash.io:6379

=== GOOGLE PLAY ===
GOOGLE_PLAY_ACCOUNT_STATUS=verified
# (We'll set up service account later)

=== DEPLOYMENT ===
RAILWAY_PROJECT_ID=xxx-xxx-xxx
# (Optional) If you want custom domain:
CUSTOM_DOMAIN=api.yourdomain.com
```

**Paste this in your next message**, and I'll:
1. ✅ Create all environment files
2. ✅ Test all connections
3. ✅ Run database migrations
4. ✅ Deploy backend to Railway
5. ✅ Download and prepare Bible data
6. ✅ Configure app for production

---

### Phase 3: What I'll Do Automatically

Once you give me the credentials, here's what I'll automate:

#### 3.1 Environment Configuration (2 minutes)

```bash
# I'll create these files:
backend/.env                    # Backend environment variables
.env                           # Frontend environment variables
eas.json                       # Updated with production config
```

#### 3.2 Database Setup (5 minutes)

```bash
# I'll run these commands:
1. Test Supabase connection
2. Execute migration SQL (create all tables)
3. Verify tables created successfully
4. Set up Row Level Security policies
```

#### 3.3 Backend Deployment (10 minutes)

```bash
# I'll deploy to Railway:
1. Install Railway CLI (if not installed)
2. Login to Railway
3. Link project
4. Set all environment variables
5. Deploy backend
6. Test health endpoint
7. Give you deployment URL
```

#### 3.4 Bible Data Preparation (15 minutes)

```bash
# I'll download and prepare Bible:
1. Download Telugu Bible from eBible.org
2. Run parsing scripts
3. Generate SQLite database
4. Verify 66 books, 31,102 verses
5. Create FTS5 search index
```

#### 3.5 Testing (5 minutes)

```bash
# I'll test all services:
1. Backend health check ✓
2. Database connection ✓
3. OpenAI API ✓
4. Redis cache ✓
5. Supabase Auth ✓
```

**Total automated time**: ~40 minutes

You'll get a complete report of what was set up!

---

### Phase 4: App Assets (YOU DO THIS - 2-3 hours)

I **cannot** create visual assets (icon, graphics) because they require design decisions. But I'll give you:

#### 4.1 What You Need to Create

**App Icon** (512x512 PNG):
- Simple Telugu Bible icon
- Primary color: #007AFF (blue)
- Tools: Canva (free), Figma, or hire on Fiverr ($5-20)

**Feature Graphic** (1024x500):
- App name + tagline + visual
- Use same color scheme

**Screenshots** (8 images, 1080x1920):
- I'll give you exact instructions on which screens to capture
- You just run the app and take screenshots

#### 4.2 What I'll Do

Once you give me the image files:
- ✅ Optimize images (compress, resize if needed)
- ✅ Validate dimensions
- ✅ Prepare for Play Store upload
- ✅ Give you upload instructions

---

### Phase 5: Privacy Policy Hosting (YOU DO THIS - 15 min)

**Option A: GitHub Pages (Free, Easiest)**

1. Go to https://github.com
2. Create new repository: `bible-sermon-legal`
3. Upload `PRIVACY_POLICY.md` and `TERMS_OF_SERVICE.md`
4. Go to Settings → Pages → Enable GitHub Pages
5. Your URLs will be:
   ```
   https://your-username.github.io/bible-sermon-legal/PRIVACY_POLICY
   https://your-username.github.io/bible-sermon-legal/TERMS_OF_SERVICE
   ```

**Option B: Google Sites (Free)**

1. Go to https://sites.google.com
2. Create new site
3. Create 2 pages, copy content from the .md files
4. Publish

**✅ What to give me**: The 2 URLs once hosted

---

### Phase 6: Build App (I DO THIS - 30 min)

Once environment is set up:

```bash
# I'll run:
1. Install dependencies
2. Configure EAS Build
3. Build production AAB
4. Test build locally
5. Upload to Google Play Internal Testing
```

You'll get:
- ✅ Production AAB file
- ✅ Build URL
- ✅ Test instructions

---

### Phase 7: Play Store Setup (WE DO TOGETHER - 1-2 hours)

**You do**:
1. Complete store listing (I'll give you exact text to copy-paste)
2. Upload assets (I'll prepare them)
3. Create subscription products (I'll give you exact settings)
4. Click "Submit for Review"

**I'll provide**:
- ✅ Complete store description (copy-paste ready)
- ✅ Subscription product configurations
- ✅ Content rating answers
- ✅ Step-by-step instructions

---

## 🔒 Security Note

**How to share credentials safely**:

1. **Option A (Recommended)**: Share in this chat
   - This conversation is private
   - I won't store credentials beyond this session
   - You can revoke API keys later if needed

2. **Option B**: Use environment variable format
   - Just paste the template I provided above
   - Makes it easy for me to automate

**What I'll NEVER do**:
- ❌ Store your credentials permanently
- ❌ Share credentials with anyone
- ❌ Use credentials for anything except setting up YOUR app
- ❌ Commit credentials to Git

**What you should do after setup**:
- ✅ Rotate OpenAI API key (optional, after launch)
- ✅ Keep Supabase service_role key secret
- ✅ Enable 2FA on all accounts

---

## 📊 Timeline Summary

| Phase | Who | Time |
|-------|-----|------|
| Create accounts | YOU | 1 hour |
| Give me credentials | YOU | 5 min |
| **Automated setup** | **ME** | **40 min** |
| Create app assets | YOU | 2-3 hours |
| Host privacy policy | YOU | 15 min |
| **Build app** | **ME** | **30 min** |
| Play Store submission | BOTH | 1-2 hours |

**Total YOUR time**: ~5-6 hours spread over 1-2 weeks
**Total MY time**: ~70 minutes (automated)

---

## 🚀 Ready to Start?

### Step 1: Create Accounts (1 hour)

Do the 5 account setups above:
1. ✅ Supabase
2. ✅ OpenAI
3. ✅ Upstash Redis
4. ✅ Railway
5. ✅ Google Play Console

### Step 2: Copy Template

Copy this and fill in your values:

```
=== CREDENTIALS FOR BIBLE SERMON ASSISTANT ===

=== SUPABASE ===
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

=== OPENAI ===
OPENAI_API_KEY=

=== REDIS ===
REDIS_URL=

=== STATUS ===
GOOGLE_PLAY_ACCOUNT_VERIFIED=yes/no
RAILWAY_PROJECT_CREATED=yes/no

=== OPTIONAL ===
CUSTOM_DOMAIN=
```

### Step 3: Paste in Chat

Send me the filled template, and I'll:
1. Create all environment files
2. Set up database
3. Deploy backend
4. Prepare Bible data
5. Test everything
6. Give you next steps

---

## ❓ Common Questions

**Q: Is it safe to share API keys in chat?**
A: This chat is private. I'll only use credentials to set up YOUR app. You can rotate keys later if concerned.

**Q: Do I need to pay for all services now?**
A: Most have free tiers:
- Supabase: Free (upgrade to Pro $25/mo when you have users)
- Upstash: Free tier sufficient for testing
- Railway: $5/mo (free trial available)
- OpenAI: $5 minimum deposit, ~$3-10/mo actual usage

**Q: What if I make a mistake in credentials?**
A: No problem! Just send corrected values and I'll update.

**Q: Can you create the app icon for me?**
A: I can't create visual designs, but I can:
- Give you exact specifications
- Recommend tools (Canva, Figma)
- Optimize/validate images you create

**Q: How long until app is live?**
A: Timeline:
- Setup: 1-2 days (your accounts + my automation)
- Assets: 2-3 days (you create)
- Build & test: 1 day (automated)
- Play Store review: 1-7 days (Google)
- **Total: 1-2 weeks**

---

## 📞 Need Help?

If you get stuck on any step:
1. Take a screenshot
2. Tell me which step you're on
3. I'll guide you through it

---

**Ready? Start with Phase 1 (Create Accounts) and paste your credentials when ready!** 🚀
