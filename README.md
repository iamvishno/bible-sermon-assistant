# Bible Sermon Assistant

AI-powered sermon generation app for Telugu-speaking pastors and preachers.

## Overview

Bible Sermon Assistant is a mobile-first application that helps pastors and preachers create high-quality sermons from any Bible verse using AI. The app features offline Bible reading, cloud sync, and a subscription-based monetization model.

### Key Features

- **Offline Bible Reader**: Telugu Common Language Bible with bookmarks, highlights, and notes
- **AI Sermon Generation**: Generate expository, topical, narrative, and devotional sermons using GPT-3.5/4
- **Cloud Sync**: Seamless synchronization across devices
- **Subscription Tiers**: Free, Basic ($4.99/mo), Premium ($9.99/mo), Ministry ($29.99/mo)
- **Smart Caching**: 80% cache hit rate to minimize AI costs

## Tech Stack

### Mobile App
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Local Database**: SQLite
- **Authentication**: Supabase Auth

### Backend
- **Framework**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis (Upstash)
- **AI**: OpenAI API (GPT-3.5-turbo, GPT-4)
- **Payments**: Google Play Billing, Razorpay

## Project Structure

```
BibleSermonAssistant/
├── src/                      # Mobile app source
│   ├── navigation/           # React Navigation setup
│   ├── screens/              # App screens
│   ├── components/           # Reusable components
│   ├── stores/               # Zustand stores
│   ├── services/             # Business logic
│   ├── db/                   # SQLite schema
│   ├── api/                  # API client
│   ├── utils/                # Utilities
│   └── types/                # TypeScript types
├── assets/                   # Static assets
│   └── bible.db              # Bundled Telugu Bible
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Pydantic models
│   │   └── utils/            # Utilities
│   └── tests/                # Backend tests
└── scripts/                  # Build/data scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Expo CLI: `npm install -g expo-cli`
- Android Studio (for Android development)
- Supabase account
- OpenAI API key
- Redis instance (Upstash free tier)

### Mobile App Setup

1. Install dependencies:
```bash
cd BibleSermonAssistant
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`

4. Start the development server:
```bash
npm start
```

5. Run on Android:
```bash
npm run android
```

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Run the development server:
```bash
python app/main.py
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL migrations in `backend/migrations/` (to be created)
3. Copy your Supabase URL and keys to `.env` files

### Bible Data Preparation

The Telugu Bible data will be sourced from eBible.org and bundled with the app.

1. Download Telugu Bible from eBible.org (CC0 license)
2. Run the parsing script:
```bash
python scripts/parse_usfm.py
```

3. Create SQLite database:
```bash
python scripts/create_bible_db.py
```

## Development Roadmap

### Sprint 0: Project Setup (Week 0-2) ✅
- [x] Initialize Expo project with TypeScript
- [x] Create project structure
- [x] Set up FastAPI backend
- [ ] Configure Supabase
- [ ] Set up Redis cache
- [ ] Configure CI/CD

### Sprint 1: Bible Reader Foundation (Week 2-4)
- [ ] Source Telugu Bible data
- [ ] Parse and bundle Bible in SQLite
- [ ] Implement Bible navigation UI
- [ ] Add reading progress tracking

### Sprint 2: Authentication & Sync (Week 4-6)
- [ ] Implement authentication
- [ ] Build sync service
- [ ] Create user profile

### Sprint 3: Verse Interactions (Week 6-8)
- [ ] Bookmarks, highlights, notes
- [ ] Sync with Supabase

### Sprint 4: AI Sermon Generation (Week 8-10)
- [ ] OpenAI integration
- [ ] Sermon generation API
- [ ] Sermon UI flow
- [ ] Quota management

### Sprint 5: Subscription & Monetization (Week 10-11)
- [ ] Google Play Billing integration
- [ ] Subscription tiers
- [ ] Payment flow

### Sprint 6: Polish & Launch (Week 11-12)
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Testing
- [ ] Play Store submission

## Subscription Tiers

| Tier | Price | AI Quota | Model | Features |
|------|-------|----------|-------|----------|
| Free | $0 | 3/month | GPT-3.5 | Basic features, ads |
| Basic | $4.99/mo | 30/month | GPT-3.5 | 3 sermon styles, no ads, cloud sync |
| Premium | $9.99/mo | 100/month | GPT-4 | 10+ styles, all languages, branded export |
| Ministry | $29.99/mo | Unlimited | GPT-4 | 10 seats, bulk generation, priority support |

## AI Cost Optimization

- **Redis Caching**: 7-day TTL, 80% hit rate target
- **Prompt Optimization**: Structured JSON output, token limits
- **Model Selection**: GPT-3.5-turbo default, GPT-4 for Premium+
- **Quota Limits**: Prevent abuse and control costs
- **Daily Spend Cap**: $10/day emergency limit

**Estimated Monthly AI Cost**: $3-10 with caching (vs. $15 without)

## Testing

### Unit Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

### E2E Tests
```bash
npm run test:e2e
```

## Deployment

### Mobile App
- Build AAB: `expo build:android`
- Upload to Play Store internal track
- Staged rollout: 10% → 50% → 100%

### Backend
- Deploy to Railway/Render
- Auto-deploy on `main` branch push
- Environment variables via dashboard

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact support or create an issue in the repository.

---

**Built with ❤️ for Telugu pastors and preachers**
