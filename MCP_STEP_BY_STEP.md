# MCP Setup - Step by Step Interactive Guide

Follow these steps **in order**. After each step, confirm completion before moving to the next.

---

## ✅ Step 1: Install MCP Servers (5 minutes)

### Windows Users:
```bash
# Run the installation script
cd "C:\Users\aivis\Desktop\BIBLE SERMON ASSISTANT\BibleSermonAssistant"
scripts\install_mcp_servers.bat
```

### Mac/Linux Users:
```bash
# Make script executable and run
cd "~/Desktop/BIBLE SERMON ASSISTANT/BibleSermonAssistant"
chmod +x scripts/install_mcp_servers.sh
./scripts/install_mcp_servers.sh
```

### Manual Installation (if script fails):
```bash
npm install -g @supabase/mcp-server @redis/mcp-redis @modelcontextprotocol/server-github @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-fetch
```

### Verify Installation:
```bash
# Check if installed
npm list -g @supabase/mcp-server
npm list -g @redis/mcp-redis
```

**✓ Checkpoint**: You should see version numbers for each package

**Tell me**: "Step 1 complete" or share any errors

---

## ✅ Step 2: Create Supabase Account & Project (10 minutes)

### 2.1: Sign Up
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub** (recommended) or email
4. Verify email if needed

### 2.2: Create Project
1. Click **"New Project"**
2. Fill in:
   - **Name**: `bible-sermon-assistant`
   - **Database Password**: Click **"Generate password"** → **SAVE THIS PASSWORD!**
   - **Region**: `ap-south-1` (India) or closest to you
   - **Pricing Plan**: **Free**
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for initialization

### 2.3: Get Credentials

Once project is ready, go to **Settings** → **API**:

**Copy these 3 values** (we'll use them soon):

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

Also go to **Settings** → **Database** → scroll down:

```
JWT Secret: your-super-secret-jwt-token-here
```

**✓ Checkpoint**: You have 3 credentials copied

**Tell me**: "Step 2 complete - have Supabase credentials"

---

## ✅ Step 3: Create Upstash Redis (5 minutes)

### 3.1: Sign Up
1. Go to https://upstash.com
2. Click **"Get Started"**
3. Sign up with **GitHub**, **Google**, or email
4. Verify email

### 3.2: Create Database
1. Click **"Create Database"**
2. Fill in:
   - **Name**: `bible-sermon-cache`
   - **Type**: **Regional**
   - **Region**: Same as Supabase or closest to users
   - **Eviction**: **allkeys-lru**
   - **TLS**: Enabled (default)
3. Click **"Create"**

### 3.3: Get Connection URL

In your database dashboard:
1. Scroll to **REST API** section
2. Copy **UPSTASH_REDIS_REST_URL**:

```
https://xxxxxxxxx.upstash.io
```

**Note**: Copy the full URL including `https://`

**✓ Checkpoint**: You have Redis URL copied

**Tell me**: "Step 3 complete - have Redis URL"

---

## ✅ Step 4: Get OpenAI API Key (5 minutes)

### 4.1: Create Account
1. Go to https://platform.openai.com
2. Click **"Sign up"**
3. Sign up with **Google**, **Microsoft**, or email
4. Verify email

### 4.2: Add Payment Method
1. Go to **Settings** → **Billing**
2. Click **"Add payment method"**
3. Add credit/debit card
4. Set spending limit: **$10/month** (recommended for testing)

### 4.3: Create API Key
1. Go to **API keys** (left sidebar)
2. Click **"Create new secret key"**
3. Name: `bible-sermon-assistant`
4. Click **"Create secret key"**
5. **COPY THE KEY NOW** - you won't see it again!

```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**✓ Checkpoint**: You have OpenAI API key copied

**Tell me**: "Step 4 complete - have OpenAI key"

---

## ✅ Step 5: Configure Claude Desktop (10 minutes)

### 5.1: Open Config File

**Windows**:
1. Press `Win + R`
2. Type: `%APPDATA%\Claude`
3. Open or create: `claude_desktop_config.json`

**Mac**:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux**:
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

### 5.2: Paste Configuration

Replace **entire file contents** with this (update YOUR_... placeholders):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL_HERE",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY_HERE"
      }
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@redis/mcp-redis"],
      "env": {
        "REDIS_URL": "YOUR_REDIS_URL_HERE"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\aivis\\Desktop\\BIBLE SERMON ASSISTANT"
      ]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

### 5.3: Replace Placeholders

Find and replace these 3 values with your actual credentials:

```json
"SUPABASE_URL": "https://xxxxxxxxxxxxx.supabase.co",
"SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
"REDIS_URL": "https://default:xxxxx@xxxxx.upstash.io"
```

**Important**:
- Keep the quotes `""`
- Don't add extra spaces
- Don't change other parts

### 5.4: Save and Restart

1. **Save** the file (Ctrl+S)
2. **Close** Claude Desktop completely
3. **Restart** Claude Desktop
4. Look for **MCP indicators** in the interface

**✓ Checkpoint**: Claude Desktop shows MCP servers connected

**Tell me**: "Step 5 complete - Claude Desktop configured"

---

## ✅ Step 6: Verify MCP Connection (2 minutes)

Now that MCP is configured, let me test the connections.

**Ask me to do these tests**:

1. "Test Supabase connection"
2. "Test Redis connection"
3. "List project files"

**✓ Checkpoint**: All tests return successful responses

**Tell me**: "Step 6 complete - all MCP servers working"

---

## ✅ Step 7: Automated Setup Begins!

Once MCP servers are verified, I will automatically:

### 7.1: Database Setup
- ✅ Run Supabase migration (create all 8 tables)
- ✅ Verify schema integrity
- ✅ Set up Row Level Security
- ✅ Create database functions and triggers

### 7.2: Bible Data Setup
- ✅ Download Telugu Bible from eBible.org
- ✅ Parse USFM files
- ✅ Create SQLite database
- ✅ Generate FTS5 search index
- ✅ Verify data integrity

### 7.3: Configuration Files
- ✅ Create mobile .env file
- ✅ Create backend .env file
- ✅ Add all credentials
- ✅ Set up environment variables

### 7.4: Verification
- ✅ Test backend startup
- ✅ Verify API health
- ✅ Test database connections
- ✅ Test cache operations

**All of this happens automatically - you just watch!**

---

## 🎯 Current Status

**Where are you now?**

- [ ] Step 1: Install MCP servers
- [ ] Step 2: Create Supabase account
- [ ] Step 3: Create Upstash Redis
- [ ] Step 4: Get OpenAI API key
- [ ] Step 5: Configure Claude Desktop
- [ ] Step 6: Verify MCP connections
- [ ] Step 7: Automated setup (I do this)

---

## 🆘 Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org (LTS version)

### "Permission denied" on Mac/Linux
Use `sudo`:
```bash
sudo npm install -g @supabase/mcp-server ...
```

### "MCP servers not showing in Claude Desktop"
1. Check config file syntax (valid JSON)
2. Check file location is correct
3. Restart Claude Desktop completely
4. Check for error messages in Claude

### "Connection failed" for Supabase/Redis
1. Verify credentials are correct
2. Check no extra spaces in config
3. Ensure URLs include `https://`
4. Check service is actually created

---

## 📞 Communication Protocol

After each step, tell me:
- **"Step X complete"** - if successful
- **"Step X error: [error message]"** - if issues
- **"Need help with Step X"** - if stuck

I'll guide you through any issues!

---

## ⏭️ What's Next

Once all 6 steps are complete:

1. I'll run automated setup (Step 7)
2. I'll verify everything works
3. I'll continue with Task #8 (Sync Service)
4. I'll implement Task #9 (Verse Interactions)
5. I'll build Task #10-11 (AI Sermon Generation)
6. **Your app will be functional!**

---

**Ready to start?**

**Tell me when you complete Step 1!** 🚀
