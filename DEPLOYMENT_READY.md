# Bible Sermon Assistant - Production Deployment Guide

## Overview
Your app is now configured for production deployment to the Google Play Store. This guide covers everything you need to do.

---

## Part 1: Backend Deployment to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for auto-deploy)

### Step 2: Create New Web Service
1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `bible-sermon-api`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Docker
   - **Plan**: Free (or Starter $7/month for production)

### Step 3: Add Environment Variables in Render
Go to **Environment** tab and add these variables:

```
SUPABASE_URL=https://aviassxdtdoqfcyesffg.supabase.co
SUPABASE_KEY=<your-supabase-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
SUPABASE_ANON_KEY=sb_publishable_znH_qoIAICQ4sTTTiW3DgQ_y6UmNnk3
OPENAI_API_KEY=<your-openai-api-key>
REDIS_URL=<your-upstash-redis-url>
DEBUG=false
ENVIRONMENT=production
PORT=8000
HOST=0.0.0.0
ALLOWED_ORIGINS=https://your-app.onrender.com
MAX_REQUESTS_PER_MINUTE=60
CACHE_TTL_SECONDS=604800
```

### Step 4: Deploy
Click **Create Web Service** - Render will auto-deploy.

### Step 5: Get Your API URL
After deployment, you'll get a URL like:
`https://bible-sermon-api.onrender.com`

**Save this URL** - you'll need it for the mobile app.

---

## Part 2: Update Mobile App for Production

### Step 1: Update Production Environment File
Edit `.env.production` and replace:
```
EXPO_PUBLIC_API_BASE_URL=https://YOUR-RENDER-URL.onrender.com
```

### Step 2: Configure EAS Project
Run these commands:

```bash
# Login to Expo
npx eas login

# Configure EAS for your account
npx eas init

# This will give you a project ID - update app.json with it
```

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/your-actual-project-id"
    }
  }
}
```

---

## Part 3: Google Play Store Setup

### Step 1: Create Google Play Developer Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time fee
3. Complete account verification (can take 48 hours)

### Step 2: Create Firebase Project (for google-services.json)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create Project** → Name it "BibleSermonAssistant"
3. Add Android app:
   - Package name: `com.biblesermonassistant.app`
   - App nickname: Bible Sermon Assistant
4. Download `google-services.json`
5. Place it in your project root (same folder as app.json)

### Step 3: Create App in Play Console
1. Click **Create app**
2. Fill in:
   - App name: Bible Sermon Assistant
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free (with in-app purchases)
3. Complete all required sections:
   - App content (privacy policy, ads declaration)
   - Store listing
   - Content rating questionnaire

### Step 4: Create In-App Products (Subscriptions)
Go to **Monetize** → **Products** → **Subscriptions**

Create these products:
| Product ID | Name | Price |
|------------|------|-------|
| basic_monthly | Basic Monthly | $1.49 |
| basic_yearly | Basic Yearly | $11.99 |
| standard_monthly | Standard Monthly | $2.99 |
| standard_yearly | Standard Yearly | $23.99 |
| premium_monthly | Premium Monthly | $5.99 |
| premium_yearly | Premium Yearly | $47.99 |

---

## Part 4: Build and Submit

### Step 1: Install Dependencies
```bash
cd BibleSermonAssistant
npm install
```

### Step 2: Build Production APK for Testing
```bash
# First build a preview APK to test on your device
npx eas build --profile preview --platform android
```

Download and install the APK on your Android phone to test.

### Step 3: Build Production AAB for Play Store
```bash
# Build the production app bundle
npx eas build --profile production --platform android
```

This generates a `.aab` file for Play Store submission.

### Step 4: Create Service Account for Auto-Submit (Optional)
1. Go to Google Cloud Console
2. Create Service Account with permissions
3. Download JSON key file
4. Save as `google-play-service-account.json` in project root
5. Link in Play Console under **Setup** → **API access**

### Step 5: Submit to Play Store
```bash
# Auto-submit to Play Store internal track
npx eas submit --platform android
```

Or manually:
1. Go to Play Console
2. **Release** → **Production** → **Create new release**
3. Upload the `.aab` file
4. Add release notes
5. Submit for review

---

## Part 5: Store Listing Assets Needed

### Required Graphics
Create these images and place in `store-assets/`:

| Asset | Size | Purpose |
|-------|------|---------|
| Feature Graphic | 1024 x 500 | Play Store header |
| Phone Screenshots | 1080 x 1920 | At least 2 required |
| App Icon | 512 x 512 | Hi-res icon for store |

### Screenshots to Capture
Capture these screens from your app:
1. Bible Reader (showing Telugu text)
2. Sermon Generator settings
3. Generated Sermon view
4. Search results
5. Subscription plans
6. Profile/Settings

### Store Description
Use the text in `store-assets/play-store-listing.json`

---

## Part 6: Post-Launch Checklist

### After Approval
- [ ] Set up staged rollout (10% → 50% → 100%)
- [ ] Monitor crash reports in Play Console
- [ ] Set up Google Analytics events
- [ ] Enable Play Console alerts

### Monitoring
- Render Dashboard: Check API health
- Supabase Dashboard: Monitor database usage
- OpenAI Dashboard: Track API costs
- Play Console: Review ratings and crashes

---

## Quick Commands Reference

```bash
# Development
npm start                    # Start Expo dev server
npm run backend:dev          # Start backend with hot reload

# Building
npm run build:preview        # Build test APK
npm run build:production     # Build production AAB

# Submitting
npm run submit               # Submit to Play Store

# Type checking
npm run type-check           # Run TypeScript checks
npm run lint                 # Run ESLint
npm test                     # Run tests
```

---

## Environment Variables Summary

### Frontend (.env.production)
```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
EXPO_PUBLIC_API_BASE_URL=<your-render-url>
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_PLAY_STORE_ENABLED=true
```

### Backend (Render Environment)
```
SUPABASE_URL=<supabase-url>
SUPABASE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>
OPENAI_API_KEY=<openai-key>
REDIS_URL=<upstash-url>
ENVIRONMENT=production
```

---

## Estimated Costs

| Service | Monthly Cost |
|---------|--------------|
| Render (Free tier) | $0 |
| Render (Starter) | $7 |
| Supabase (Free tier) | $0 |
| Supabase (Pro) | $25 |
| OpenAI API | ~$5-20 |
| Upstash Redis (Free) | $0 |
| Google Play (One-time) | $25 |
| **Total Starting** | **~$25 one-time** |
| **Total Monthly (Scaled)** | **~$40-50** |

---

## Support Contacts

- Expo Documentation: https://docs.expo.dev
- Render Documentation: https://render.com/docs
- Play Console Help: https://support.google.com/googleplay/android-developer

---

**Your app is ready for deployment!** Follow the steps above in order.
