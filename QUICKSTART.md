# Quick Start Guide

Get your Bible Sermon Assistant development environment up and running quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Expo CLI: `npm install -g expo-cli`
- [ ] Android Studio (for Android development)
- [ ] Git installed
- [ ] Supabase account created
- [ ] OpenAI API key obtained
- [ ] Redis instance (Upstash free tier)

## 5-Minute Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd BibleSermonAssistant

# Install mobile app dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 2: Configure Environment Variables

#### Mobile App

```bash
# Create .env file in root directory
cp .env.example .env
```

Edit `.env` and add:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:8000
```

#### Backend

```bash
# Create .env file in backend directory
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-your-openai-key
REDIS_URL=redis://default:password@host:port
```

### Step 3: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Open **SQL Editor**
3. Copy contents of `backend/migrations/001_initial_schema.sql`
4. Paste and run in SQL Editor
5. Follow instructions in `backend/migrations/README.md` to set up cron jobs

### Step 4: Start Development Servers

#### Terminal 1: Backend API

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app/main.py
```

Backend will run at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

#### Terminal 2: Mobile App

```bash
# From project root
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for web

### Step 5: Verify Setup

1. Check backend health: `http://localhost:8000/health`
2. Check API docs: `http://localhost:8000/docs`
3. Mobile app should load with placeholder screens
4. Verify Supabase connection in backend logs

## Common Issues

### Port 8000 already in use

```bash
# Kill process on port 8000 (Linux/Mac)
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Expo not starting

```bash
# Clear Expo cache
expo start -c

# Or reinstall Expo CLI
npm install -g expo-cli@latest
```

### Backend import errors

```bash
# Ensure virtual environment is activated
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Supabase connection failed

- Verify URL and keys in `.env` files
- Check Supabase project is running
- Ensure RLS policies are set up correctly

## Development Workflow

### Making Changes

1. **Mobile App Changes**: Edit files in `src/`, hot reload is automatic
2. **Backend Changes**: Edit files in `backend/app/`, server auto-reloads with `--reload` flag
3. **Database Changes**: Create new migration in `backend/migrations/`

### Running Tests

```bash
# Mobile app tests
npm test

# Backend tests
cd backend
pytest

# Type checking
npm run type-check
```

### Viewing Logs

```bash
# Backend logs
cd backend
tail -f logs/app.log  # If logging to file

# Mobile app logs
# Visible in Expo developer tools (opens in browser)
```

## Next Steps

Now that your environment is set up, you can:

1. **Sprint 1**: Source Telugu Bible data and implement Bible Reader
2. **Sprint 2**: Build authentication and sync service
3. **Sprint 3**: Implement verse interactions (bookmarks, highlights)
4. **Sprint 4**: Build AI sermon generation (core feature!)
5. **Sprint 5**: Integrate subscription system
6. **Sprint 6**: Polish and prepare for launch

## Useful Commands

```bash
# Mobile app
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm test              # Run tests
npm run type-check    # TypeScript type checking
npm run lint          # Lint code

# Backend
python app/main.py                              # Start backend
uvicorn app.main:app --reload                  # Start with auto-reload
pytest                                          # Run tests
pytest --cov=app tests/                        # Run tests with coverage
python -m black app/                           # Format code
python -m pylint app/                          # Lint code
```

## Project Structure Quick Reference

```
BibleSermonAssistant/
├── src/                    # Mobile app source
│   ├── screens/            # UI screens
│   ├── components/         # Reusable components
│   ├── services/           # Business logic
│   ├── stores/             # State management (Zustand)
│   ├── navigation/         # React Navigation
│   └── types/              # TypeScript definitions
├── backend/                # Python backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Pydantic models
│   │   └── utils/          # Utilities
│   └── migrations/         # Database migrations
└── assets/                 # Static assets
```

## Getting Help

- Check `README.md` for comprehensive documentation
- Review `backend/migrations/README.md` for database setup
- See issue tracker for known issues
- Review API documentation at `http://localhost:8000/docs`

## Development Tips

1. **Use Hot Reload**: Both mobile and backend support hot reload
2. **Check Logs**: Always check console/terminal for errors
3. **Test Early**: Run tests frequently during development
4. **Commit Often**: Use Git to checkpoint your progress
5. **Follow Plan**: Reference the implementation plan in sprint order

---

Happy coding! 🚀
