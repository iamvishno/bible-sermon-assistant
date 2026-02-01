# 🚀 Deployment Guide

Complete step-by-step guide to deploy Bible Sermon Assistant to production.

---

## 📋 Pre-Deployment Checklist

### Code Ready
- [x] All features implemented
- [x] Tests passing
- [x] Code reviewed
- [x] Documentation complete
- [ ] Environment variables configured
- [ ] Secrets secured

### Services Ready
- [ ] Supabase project created
- [ ] OpenAI API key obtained
- [ ] Redis instance configured
- [ ] Google Play account setup
- [ ] Railway account created
- [ ] Domain registered (optional)

---

## 🗄️ Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in details:
   - **Name**: bible-sermon-assistant
   - **Database Password**: (Generate strong password)
   - **Region**: Choose closest to users (e.g., Mumbai for India)
   - **Plan**: Pro ($25/month recommended for production)

4. Wait for project to initialize (~2 minutes)

### Step 2: Run Database Migrations

1. Copy SQL from `backend/migrations/001_initial_schema.sql`
2. In Supabase dashboard:
   - Go to SQL Editor
   - Create new query
   - Paste migration SQL
   - Click "Run"

3. Verify tables created:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

   Should see:
   - user_profiles
   - sermons
   - subscriptions
   - bookmarks
   - highlights
   - verse_notes
   - ai_cache
   - sync_operations

### Step 3: Enable Row Level Security

RLS is already included in the migration, but verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### Step 4: Get API Keys

1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: For mobile app
   - **service_role**: For backend (KEEP SECRET!)

3. Go to Settings → Auth → JWT Secret
   - Copy **JWT Secret**: For backend token verification

---

## 💾 Part 2: Redis Cache Setup (Upstash)

### Step 1: Create Redis Database

1. Go to https://upstash.com
2. Sign up / Sign in
3. Click "Create Database"
4. Configure:
   - **Name**: bible-sermon-cache
   - **Type**: Regional
   - **Region**: Same as Supabase
   - **Eviction**: No eviction (we manage TTL)

5. Click "Create"

### Step 2: Get Connection String

1. Click on your database
2. Go to "Details" tab
3. Copy **REST URL** or **Redis URL**:
   ```
   redis://:password@hostname:port
   ```

### Step 3: Test Connection

```bash
redis-cli -u redis://:password@hostname:port
> PING
PONG
```

---

## 🤖 Part 3: OpenAI API Setup

### Step 1: Get API Key

1. Go to https://platform.openai.com
2. Sign up / Sign in
3. Go to API Keys
4. Click "Create new secret key"
5. Name it: "bible-sermon-assistant-prod"
6. Copy the key (starts with `sk-`)

### Step 2: Add Credits

1. Go to Billing
2. Add payment method
3. Set up monthly billing or prepaid credits
4. **Recommended**: Set usage limits ($50/month)

### Step 3: Monitor Usage

Set up alerts:
1. Go to Usage → Limits
2. Set up email alerts:
   - Soft limit: $30/month
   - Hard limit: $50/month

---

## 🚂 Part 4: Backend Deployment (Railway)

### Step 1: Install Railway CLI

```bash
# macOS
brew install railway

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Or use NPM
npm install -g @railway/cli
```

### Step 2: Login and Initialize

```bash
# Login to Railway
railway login

# Link to project
cd backend
railway init
```

### Step 3: Set Environment Variables

```bash
# Set all environment variables
railway variables set SUPABASE_URL=https://xxx.supabase.co
railway variables set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
railway variables set SUPABASE_JWT_SECRET=your-jwt-secret
railway variables set OPENAI_API_KEY=sk-...
railway variables set REDIS_URL=redis://...
railway variables set DEBUG=false
railway variables set ALLOWED_ORIGINS=https://yourdomain.com
```

Or use Railway dashboard:
1. Go to your project
2. Click on service
3. Go to Variables tab
4. Add each variable

### Step 4: Deploy

```bash
# Deploy using Dockerfile
railway up

# Or connect GitHub repo for auto-deploy
# 1. Push code to GitHub
# 2. In Railway dashboard, connect repo
# 3. Auto-deploys on every push to main
```

### Step 5: Verify Deployment

1. Railway will give you a URL: `https://xxx.railway.app`
2. Test health endpoint:
   ```bash
   curl https://xxx.railway.app/health
   ```

3. Should return:
   ```json
   {
     "status": "healthy",
     "service": "Bible Sermon Assistant API",
     "version": "1.0.0"
   }
   ```

### Step 6: Set Up Custom Domain (Optional)

1. In Railway dashboard → Settings
2. Click "Generate Domain" or "Custom Domain"
3. If custom: Add CNAME record to your DNS:
   ```
   api.yourdomain.com → xxx.railway.app
   ```

---

## 📱 Part 5: Mobile App Deployment (EAS Build)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Configure EAS Build

Update `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "env": {
          "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
          "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...",
          "EXPO_PUBLIC_API_BASE_URL": "https://xxx.railway.app"
        }
      }
    }
  }
}
```

### Step 4: Build Android App Bundle

```bash
# First build (creates signing credentials)
eas build --platform android --profile production

# Follow prompts to create keystore
# IMPORTANT: Save credentials backup!
```

### Step 5: Download AAB

1. Build will run in cloud (~10-15 minutes)
2. When complete, download the AAB file
3. Save to safe location

---

## 🏪 Part 6: Google Play Store Setup

### Step 1: Create Developer Account

1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Complete account verification

### Step 2: Create App

1. Click "Create app"
2. Fill in details:
   - **App name**: Bible Sermon Assistant
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)

### Step 3: Upload AAB to Internal Testing

1. Go to Testing → Internal testing
2. Create new release
3. Upload AAB file from EAS Build
4. Fill in release notes
5. Save and review
6. Start rollout to internal testing

### Step 4: Complete Store Listing

1. **Main store listing**:
   - Upload screenshots (8 images)
   - Upload feature graphic (1024x500)
   - Upload app icon (512x512)
   - Write short description (80 chars)
   - Write full description (see PLAY_STORE_SUBMISSION.md)

2. **Content rating**:
   - Complete questionnaire
   - Expected rating: Everyone

3. **App access**:
   - Select "All or some functionality is restricted"
   - Explain: "Account required for cloud sync"

4. **Ads**:
   - Select "No, my app does not contain ads" (for premium tiers)
   - Or "Yes" if showing ads on free tier

5. **App content**:
   - Privacy policy URL: https://yourdomain.com/privacy
   - Create and host privacy policy first!

### Step 5: Set Up In-App Products

1. Go to Monetize → Products → Subscriptions
2. Create 3 subscription products:

**Basic Monthly**:
- **Product ID**: `bible_sermon_assistant_basic_monthly`
- **Name**: Basic Plan
- **Description**: 30 AI sermon generations per month
- **Price**: $4.99 USD
- **Billing period**: 1 month (recurring)
- **Free trial**: 7 days (optional)

**Premium Monthly**:
- **Product ID**: `bible_sermon_assistant_premium_monthly`
- **Name**: Premium Plan
- **Description**: 100 AI sermon generations per month with GPT-4
- **Price**: $9.99 USD
- **Billing period**: 1 month (recurring)
- **Free trial**: 7 days (optional)

**Ministry Monthly**:
- **Product ID**: `bible_sermon_assistant_ministry_monthly`
- **Name**: Ministry Plan
- **Description**: Unlimited AI sermon generations with team features
- **Price**: $29.99 USD
- **Billing period**: 1 month (recurring)
- **Free trial**: 14 days (optional)

### Step 6: Create Service Account for Receipt Verification

1. Go to Setup → API access
2. Click "Create new service account"
3. Follow link to Google Cloud Console
4. Create service account:
   - **Name**: play-store-verifier
   - **Role**: Service Account User
5. Create JSON key
6. Download and save securely
7. Upload to Railway as `GOOGLE_PLAY_CREDENTIALS_PATH`

---

## 🔐 Part 7: Security & Secrets

### Environment Variables Summary

**Backend (Railway)**:
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ... (service_role key)
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
GOOGLE_PLAY_CREDENTIALS_PATH=/app/credentials.json
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Mobile App (Build-time)**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key)
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

### Secrets Management

**DO NOT**:
- ❌ Commit `.env` files to Git
- ❌ Share service_role keys publicly
- ❌ Use production keys in development

**DO**:
- ✅ Use Railway's variable management
- ✅ Keep separate dev/staging/prod environments
- ✅ Rotate keys regularly
- ✅ Use `.env.example` for documentation only

---

## 📊 Part 8: Monitoring & Analytics

### Set Up Error Tracking (Optional)

**Option 1: Sentry**

```bash
# Install Sentry
npm install @sentry/react-native
cd backend && pip install sentry-sdk[fastapi]

# Configure
eas secret:create --scope project --name SENTRY_DSN --value "your-dsn"
```

**Option 2: Railway Logs**

```bash
# View logs in real-time
railway logs

# Or use Railway dashboard → Deployments → Logs
```

### Set Up Uptime Monitoring

**Option 1: Better Uptime**
1. Go to https://betteruptime.com
2. Create free account
3. Add monitor:
   - **URL**: https://api.yourdomain.com/health
   - **Interval**: 5 minutes
   - **Alert**: Email/SMS

**Option 2: UptimeRobot**
1. Go to https://uptimerobot.com
2. Add monitor
3. Configure alerts

### Set Up Analytics (Optional)

**Google Analytics for Firebase**:
```bash
npx expo install expo-firebase-analytics
```

---

## 🧪 Part 9: Testing in Production

### Smoke Tests

After deployment, test critical flows:

1. **Health Check**:
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Authentication**:
   - Sign up new user
   - Verify email received
   - Sign in successfully

3. **Sermon Generation**:
   - Generate sermon (check quota)
   - Verify sermon saved
   - Check quota decremented

4. **Subscription**:
   - View pricing
   - Purchase subscription (test card)
   - Verify quota updated

5. **Sync**:
   - Create bookmark on device A
   - Check synced to device B

### Load Testing (Optional)

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Or use k6
npm install -g k6
k6 run load-test.js
```

---

## 📈 Part 10: Launch Checklist

### Pre-Launch (1-2 weeks before)
- [ ] All services deployed and tested
- [ ] Internal testing complete (5-10 users)
- [ ] Closed testing complete (50-100 users)
- [ ] Critical bugs fixed
- [ ] Performance acceptable
- [ ] Documentation updated

### Launch Day
- [ ] Promote to production in Play Console
- [ ] Start with 10% staged rollout
- [ ] Monitor crash reports closely
- [ ] Monitor server metrics
- [ ] Check error logs
- [ ] Respond to first reviews

### Post-Launch (Week 1)
- [ ] Increase to 50% rollout
- [ ] Continue monitoring
- [ ] Fix any critical issues
- [ ] Release hotfix if needed
- [ ] Respond to all reviews
- [ ] Increase to 100% rollout

---

## 🔄 Part 11: Continuous Deployment

### GitHub Actions Auto-Deploy

Already configured in `.github/workflows/build.yml`:

```yaml
on:
  push:
    branches: [main]
```

**Workflow**:
1. Push to `main` branch
2. GitHub Actions runs tests
3. If tests pass, deploys to Railway
4. Railway auto-deploys backend
5. EAS Build can be triggered manually

### Manual Deploy

```bash
# Backend
git push origin main  # Auto-deploys via Railway

# Mobile app
eas build --platform android --profile production --auto-submit
```

---

## 🆘 Troubleshooting

### Backend not starting

**Check Railway logs**:
```bash
railway logs
```

**Common issues**:
- Missing environment variables
- Database connection failed
- OpenAI API key invalid

### Mobile app crashes on startup

**Check in Play Console**:
1. Go to Quality → Crashes and ANRs
2. View stack traces
3. Fix and release update

### Subscriptions not working

**Verify**:
1. Service account has correct permissions
2. Product IDs match in app and Play Console
3. App is published (at least to internal testing)

---

## 🎉 Deployment Complete!

Your Bible Sermon Assistant is now live in production!

**Next steps**:
1. Monitor metrics daily
2. Respond to user feedback
3. Plan v1.1 features
4. Market the app

**🚀 Congratulations on the launch!** 🎉
