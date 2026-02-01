# 🔧 Troubleshooting Guide

Common issues and solutions for Bible Sermon Assistant.

---

## 📱 Mobile App Issues

### App Won't Start / White Screen

**Symptoms**: App shows white screen or crashes immediately

**Solutions**:

1. **Clear Expo cache**:
   ```bash
   npx expo start --clear
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check for errors in console**:
   - Look for red error messages
   - Common: Missing dependencies, incorrect imports

4. **Verify app.json**:
   - Check for syntax errors
   - Ensure all required fields present

---

### "Network Request Failed"

**Symptoms**: Can't connect to backend API

**Solutions**:

1. **Check API_BASE_URL in .env**:
   ```env
   # For emulator on same machine
   API_BASE_URL=http://10.0.2.2:8000

   # For physical device on same network
   API_BASE_URL=http://192.168.1.100:8000

   # For production
   API_BASE_URL=https://api.yourdomain.com
   ```

2. **Find your local IP**:
   ```bash
   # macOS/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

3. **Ensure backend is running**:
   ```bash
   curl http://localhost:8000/health
   ```

4. **Check firewall**:
   - Allow port 8000 in firewall
   - On Windows: Windows Defender Firewall → Allow an app

---

### Bible Data Not Loading

**Symptoms**: Empty book list or verses not showing

**Solutions**:

1. **Check if bible.db exists**:
   ```bash
   ls -la assets/bible.db
   ```

2. **Regenerate bible.db**:
   ```bash
   cd scripts
   python create_bible_db.py
   ```

3. **Check SQLite permissions**:
   - On Android: Check storage permissions
   - Try uninstall/reinstall app

4. **Verify database schema**:
   ```bash
   sqlite3 assets/bible.db
   > .schema
   > SELECT COUNT(*) FROM verses;
   ```

---

### Authentication Errors

**Symptoms**: Can't sign up or sign in

**Solutions**:

1. **Check Supabase configuration**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

2. **Verify Supabase is running**:
   - Go to Supabase dashboard
   - Check project is active (not paused)

3. **Check email confirmation**:
   - Supabase → Authentication → Email Templates
   - Ensure "Confirm Signup" is enabled

4. **Test with curl**:
   ```bash
   curl -X POST https://xxx.supabase.co/auth/v1/signup \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!"}'
   ```

---

### Subscription Purchase Fails

**Symptoms**: "Payment failed" or "Purchase not completed"

**Solutions**:

1. **Check Google Play Console**:
   - Verify app is published (at least internal testing)
   - Verify products are active

2. **Use test card** (in test environment):
   - Google Play uses test payment methods for testing

3. **Check service account**:
   - Ensure service account has correct permissions
   - Verify JSON key is valid

4. **Clear Google Play cache**:
   - Settings → Apps → Google Play Store → Clear Cache

5. **Check logs**:
   ```bash
   # In React Native app
   console.log('Purchase error:', error);
   ```

---

### Sync Not Working

**Symptoms**: Changes not syncing between devices

**Solutions**:

1. **Check internet connection**:
   - Try on WiFi
   - Check mobile data is enabled for app

2. **Check backend logs**:
   ```bash
   railway logs
   ```

3. **Manual sync**:
   - Pull down to refresh on sermons list

4. **Check sync queue**:
   ```sql
   SELECT * FROM sync_queue WHERE processed = false;
   ```

5. **Clear and re-sync**:
   - Settings → Clear Local Data
   - Sign in again

---

## 🖥️ Backend Issues

### Backend Won't Start

**Symptoms**: `uvicorn` fails to start or exits immediately

**Solutions**:

1. **Check Python version**:
   ```bash
   python --version
   # Should be 3.11+
   ```

2. **Reinstall dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Check for missing env variables**:
   ```bash
   python -c "from dotenv import load_dotenv; load_dotenv(); import os; print(os.getenv('SUPABASE_URL'))"
   ```

4. **Check port availability**:
   ```bash
   # Check if port 8000 is in use
   lsof -i :8000

   # Kill process if needed
   kill -9 <PID>
   ```

5. **Run with debug**:
   ```bash
   DEBUG=true python app/main.py
   ```

---

### Database Connection Errors

**Symptoms**: "Could not connect to database" or timeout errors

**Solutions**:

1. **Verify Supabase credentials**:
   ```env
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_KEY=eyJ... (service_role key, not anon!)
   ```

2. **Check Supabase project status**:
   - Dashboard → Project is not paused
   - Free tier projects pause after 1 week of inactivity

3. **Test connection**:
   ```python
   from supabase import create_client
   client = create_client(SUPABASE_URL, SUPABASE_KEY)
   result = client.table('user_profiles').select('*').limit(1).execute()
   print(result)
   ```

4. **Check network**:
   - Can you ping Supabase?
   - Firewall blocking connections?

---

### OpenAI API Errors

**Symptoms**: Sermon generation fails with API errors

**Solutions**:

1. **Check API key**:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

2. **Check quota/billing**:
   - Go to https://platform.openai.com/usage
   - Verify you have credits
   - Check monthly limit not exceeded

3. **Rate limit errors**:
   - Wait a few minutes
   - Reduce concurrent requests
   - Upgrade OpenAI plan

4. **Model not available**:
   - Verify GPT-4 access if using premium tier
   - Fall back to GPT-3.5-turbo

5. **Timeout errors**:
   - Increase timeout in openai_service.py
   - Check internet connection

---

### Redis Connection Errors

**Symptoms**: Cache errors or slow sermon generation

**Solutions**:

1. **Check Redis URL**:
   ```env
   REDIS_URL=redis://:password@hostname:port
   ```

2. **Test connection**:
   ```bash
   redis-cli -u $REDIS_URL
   > PING
   PONG
   ```

3. **Verify Upstash status**:
   - Dashboard shows database is active
   - No rate limits exceeded

4. **Fallback without cache**:
   - Cache failures shouldn't break app
   - Check logs for cache errors

---

## 🧪 Testing Issues

### Tests Failing

**Frontend tests fail**:

```bash
# Clear Jest cache
npm test -- --clearCache

# Update snapshots if UI changed
npm test -- -u

# Run specific test file
npm test -- BibleService.test.ts
```

**Backend tests fail**:

```bash
# Reinstall test dependencies
pip install pytest pytest-mock pytest-asyncio

# Run with verbose output
pytest -v

# Run specific test
pytest tests/test_sermons_api.py::TestSermonGeneration::test_generate_sermon_success
```

---

### Coverage Not Generated

**Solutions**:

1. **Install coverage tools**:
   ```bash
   # Frontend
   npm install --save-dev @testing-library/react-hooks

   # Backend
   pip install pytest-cov
   ```

2. **Run with coverage flags**:
   ```bash
   # Frontend
   npm test -- --coverage

   # Backend
   pytest --cov=app
   ```

---

## 🚀 Deployment Issues

### EAS Build Fails

**Symptoms**: Build fails in Expo cloud

**Solutions**:

1. **Check build logs**:
   - Go to https://expo.dev
   - View build logs for errors

2. **Common errors**:
   - **Missing dependencies**: Add to package.json
   - **Native module conflicts**: Check compatibility
   - **Out of memory**: Reduce bundle size

3. **Test local build**:
   ```bash
   eas build --platform android --local
   ```

4. **Clear EAS cache**:
   ```bash
   eas build --clear-cache
   ```

---

### Railway Deployment Fails

**Symptoms**: Deployment fails or app crashes

**Solutions**:

1. **Check Railway logs**:
   ```bash
   railway logs
   ```

2. **Common errors**:
   - **Missing env vars**: Set all required variables
   - **Port binding**: Use `$PORT` from Railway
   - **Dependencies**: Ensure requirements.txt is complete

3. **Test locally with Docker**:
   ```bash
   cd backend
   docker build -t sermon-api .
   docker run -p 8000:8000 sermon-api
   ```

4. **Redeploy**:
   ```bash
   railway up --detach
   ```

---

### Play Store Rejection

**Symptoms**: App rejected during review

**Common reasons**:

1. **Privacy Policy Missing**:
   - Must have publicly accessible privacy policy URL
   - Must explain data collection

2. **Permissions Not Explained**:
   - Explain why each permission is needed
   - Remove unused permissions

3. **Subscription Issues**:
   - Products must be active before submission
   - Clear subscription terms required

4. **Content Rating Incorrect**:
   - Re-complete content rating questionnaire
   - Ensure app content matches rating

5. **Functionality Issues**:
   - App crashes during review
   - Core functionality not working
   - Fix and resubmit

---

## 💾 Data Issues

### Lost Sermons / Bookmarks

**Symptoms**: User data disappeared

**Solutions**:

1. **Check local database**:
   ```sql
   SELECT COUNT(*) FROM sermons_local;
   SELECT COUNT(*) FROM bookmarks_local;
   ```

2. **Check sync status**:
   ```sql
   SELECT * FROM sync_queue WHERE processed = false;
   ```

3. **Manual sync**:
   - Force sync from backend
   - Check Supabase for data

4. **Restore from backup**:
   - Supabase has automatic backups (Pro plan)
   - Restore from backup if data lost

---

### Quota Not Updating

**Symptoms**: User can't generate sermons even with quota remaining

**Solutions**:

1. **Check user profile**:
   ```sql
   SELECT ai_quota_monthly, ai_quota_used, subscription_tier
   FROM user_profiles
   WHERE id = 'user-id';
   ```

2. **Manual quota reset**:
   ```sql
   UPDATE user_profiles
   SET ai_quota_used = 0
   WHERE id = 'user-id';
   ```

3. **Check quota reset date**:
   ```sql
   SELECT ai_quota_reset_at FROM user_profiles WHERE id = 'user-id';
   ```

4. **Verify subscription**:
   ```sql
   SELECT * FROM subscriptions WHERE user_id = 'user-id' AND status = 'active';
   ```

---

## 📊 Performance Issues

### Slow App Startup

**Solutions**:

1. **Reduce bundle size**:
   - Remove unused dependencies
   - Use dynamic imports for large libraries

2. **Optimize SQLite**:
   ```sql
   VACUUM;
   ANALYZE;
   ```

3. **Profile app**:
   ```bash
   npx react-native-performance-monitor
   ```

---

### Slow Search

**Solutions**:

1. **Rebuild FTS5 index**:
   ```sql
   INSERT INTO verses_fts(verses_fts) VALUES('rebuild');
   ```

2. **Add more indexes**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_verses_book_chapter
   ON verses(book_id, chapter);
   ```

3. **Limit results**:
   - Default limit to 50 results
   - Add pagination

---

### High Memory Usage

**Solutions**:

1. **Use FlatList virtualization**:
   - Ensure FlatList used for long lists
   - Set appropriate `windowSize`

2. **Clear caches**:
   ```bash
   # Clear Expo cache
   expo start --clear
   ```

3. **Optimize images**:
   - Compress images
   - Use appropriate sizes

---

## 🆘 Getting More Help

### Documentation
- [README.md](README.md) - Overview
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

### Logs
- **Mobile**: Use React Native Debugger
- **Backend**: `railway logs` or check Railway dashboard
- **Database**: Supabase dashboard → Logs

### Support Channels
- **Email**: support@biblesermonassistant.com
- **GitHub Issues**: For bug reports
- **Documentation**: Check all MD files in project root

---

**Still stuck?** Provide these details when asking for help:
1. What you were trying to do
2. What actually happened
3. Error messages (full stack trace)
4. Your environment (OS, Node version, Python version)
5. Steps to reproduce

**Happy debugging!** 🐛🔧
