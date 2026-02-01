# MCP Servers - Quick Start Guide

**Goal**: Connect Claude to your project services for automated setup
**Time**: 15 minutes
**Benefit**: I can directly access Supabase, Redis, GitHub without you copy-pasting credentials

---

## What Are MCP Servers?

MCP (Model Context Protocol) servers let me connect directly to your services:
- **Supabase** - I can query database, create tables, run migrations
- **Redis** - I can test cache, monitor stats
- **GitHub** - I can commit code, create PRs
- **Filesystem** - I can read/write project files

---

## Quick Setup (3 Steps)

### Step 1: Install MCP Servers (5 min)

Open terminal and run:

```bash
# Install all required MCP servers
npm install -g @supabase/mcp-server @redis/mcp-redis @modelcontextprotocol/server-github @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-fetch
```

### Step 2: Get Your Credentials (5 min)

You still need to create accounts, but then I can access them directly:

**Supabase** (https://supabase.com):
- Create project
- Copy: Project URL + Service Role Key

**Upstash Redis** (https://upstash.com):
- Create database
- Copy: Redis URL

**GitHub** (optional):
- Settings → Developer → Personal Access Tokens
- Create token with `repo` permissions

### Step 3: Configure Claude Desktop (5 min)

1. Open Claude Desktop
2. Go to **Settings** → **Developer** → **Edit Config**
3. Paste this configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "PASTE_YOUR_SUPABASE_URL_HERE",
        "SUPABASE_SERVICE_ROLE_KEY": "PASTE_YOUR_SERVICE_ROLE_KEY_HERE"
      }
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@redis/mcp-redis"],
      "env": {
        "REDIS_URL": "PASTE_YOUR_REDIS_URL_HERE"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\aivis\\Desktop\\BIBLE SERMON ASSISTANT"
      ]
    }
  }
}
```

4. Replace `PASTE_YOUR_...` with actual credentials
5. Save and restart Claude Desktop
6. Look for MCP indicators (should show connected)

---

## What Credentials to Paste

### From Supabase Dashboard

```
Settings → API:
SUPABASE_URL: https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### From Upstash Dashboard

```
Database → REST API:
REDIS_URL: redis://default:xxxxxxx@xxxxx.upstash.io
```

---

## After Configuration

Once MCP servers are connected, tell me:

**"MCP servers configured, proceed with setup"**

Then I can:
1. ✅ Test Supabase connection
2. ✅ Run database migration automatically
3. ✅ Verify all tables created
4. ✅ Test Redis cache
5. ✅ Download Bible data
6. ✅ Configure .env files
7. ✅ Initialize Git repository
8. ✅ Continue with implementation

---

## Benefits vs Manual Setup

### With MCP Servers ✅
- I query database directly → verify schema instantly
- I test Redis → confirm cache works
- I download Bible data → process automatically
- I create .env files → no copy-paste errors
- **Faster, fewer errors, automated**

### Manual Setup ❌
- You copy SQL → paste in Supabase → tell me it worked
- You test Redis → copy results → paste to me
- You download Bible → run scripts → tell me status
- You create .env → I guide you → potential typos
- **Slower, more manual work, error-prone**

---

## Your Choice

### Option A: Use MCP Servers (Recommended)
**Do**: Steps 1-3 above (15 min)
**Benefit**: Automated, efficient, direct access
**Then**: I proceed with full setup automatically

### Option B: Manual Setup
**Do**: Follow CREDENTIALS_SETUP.md (45 min)
**Benefit**: You control everything step-by-step
**Then**: You share results, I guide next steps

---

## Which Do You Prefer?

Reply with either:

1. **"Setup MCP servers"** - I'll guide you through configuration
2. **"Manual setup"** - I'll guide you through CREDENTIALS_SETUP.md
3. **"Already configured MCP"** - I'll start using them now

---

**Quick Decision Matrix**:
- Want automation → MCP servers
- Want full control → Manual setup
- Not sure → MCP servers (it's faster!)

**What's your preference?** 🚀
