# MCP Servers Setup for Bible Sermon Assistant

**Purpose**: Configure Model Context Protocol servers for automated project integration
**Benefit**: Direct access to databases, APIs, and services without manual credential entry

---

## Overview - Required MCP Servers

| MCP Server | Purpose | Status | Priority |
|------------|---------|--------|----------|
| Supabase MCP | Database operations, schema management | Available | High |
| Redis MCP | Cache operations, key management | Available | High |
| GitHub MCP | Repository management, version control | Available | Medium |
| Filesystem MCP | File operations, Bible data processing | Available | Medium |
| Fetch MCP | Download Bible data from eBible.org | Available | Low |

---

## 1. Supabase MCP Server

### What It Does
- Connect to Supabase projects directly from Claude
- Create/manage tables and migrations
- Query data and run SQL
- Manage schema and TypeScript types
- Read-only mode for safety

### Official Source
- **GitHub**: https://github.com/supabase-community/supabase-mcp
- **Documentation**: https://supabase.com/docs/guides/getting-started/mcp
- **Blog Post**: https://supabase.com/blog/mcp-server

### Installation

```bash
# Install via npx (recommended)
npx @supabase/mcp-server

# Or install globally
npm install -g @supabase/mcp-server
```

### Configuration

Add to your MCP settings file:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://xxxxx.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGci..."
      }
    }
  }
}
```

### What I Can Do With It
✅ Create database tables automatically
✅ Run SQL migrations
✅ Query user profiles, sermons, subscriptions
✅ Test database connections
✅ Generate TypeScript types
✅ Verify schema integrity

---

## 2. Redis MCP Server

### What It Does
- Natural language interface for Redis
- Manage cache keys and values
- Monitor cache hit rates
- Health check Redis database
- Work with all Redis data types

### Official Source
- **GitHub**: https://github.com/redis/mcp-redis
- **Blog Post**: https://redis.io/blog/introducing-model-context-protocol-mcp-for-redis/

### Installation

```bash
# Install Redis MCP server
npm install -g @redis/mcp-redis
```

### Configuration

```json
{
  "mcpServers": {
    "redis": {
      "command": "redis-mcp",
      "env": {
        "REDIS_URL": "redis://default:password@host:port"
      }
    }
  }
}
```

### What I Can Do With It
✅ Test Redis connections
✅ Set/get cache keys
✅ Monitor cache statistics
✅ Clear cache when needed
✅ Verify cache TTL settings
✅ Debug cache issues

---

## 3. GitHub MCP Server

### What It Does
- Create/manage repositories
- Push code commits
- Create pull requests
- Manage issues and branches
- Read repository contents

### Official Source
- **GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **Registry**: https://registry.modelcontextprotocol.io/

### Installation

```bash
# Install from official MCP servers
npm install -g @modelcontextprotocol/server-github
```

### Configuration

```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxx"
      }
    }
  }
}
```

### What I Can Do With It
✅ Initialize Git repository
✅ Commit code changes
✅ Create branches for features
✅ Push to remote repository
✅ Create pull requests
✅ Manage project issues

---

## 4. Filesystem MCP Server

### What It Does
- Secure file operations
- Read/write files
- Create directories
- Move/copy files
- Search file contents

### Official Source
- **GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
- **Type**: Official Anthropic reference implementation

### Installation

```bash
# Install filesystem MCP server
npm install -g @modelcontextprotocol/server-filesystem
```

### Configuration

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "mcp-server-filesystem",
      "args": ["C:\\Users\\aivis\\Desktop\\BIBLE SERMON ASSISTANT"]
    }
  }
}
```

### What I Can Do With It
✅ Process Bible USFM files
✅ Create/edit configuration files
✅ Generate migration scripts
✅ Organize project structure
✅ Read/write .env files safely

---

## 5. Fetch MCP Server

### What It Does
- Fetch web content
- Download files
- Make HTTP requests
- Convert HTML to markdown

### Official Source
- **GitHub**: https://github.com/modelcontextprotocol/servers/tree/main/src/fetch

### Installation

```bash
npm install -g @modelcontextprotocol/server-fetch
```

### Configuration

```json
{
  "mcpServers": {
    "fetch": {
      "command": "mcp-server-fetch"
    }
  }
}
```

### What I Can Do With It
✅ Download Telugu Bible from eBible.org
✅ Fetch API documentation
✅ Download dependencies
✅ Check service status

---

## Complete MCP Configuration File

**For Claude Desktop** (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "YOUR_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY": "YOUR_SERVICE_ROLE_KEY"
      }
    },
    "redis": {
      "command": "npx",
      "args": ["-y", "@redis/mcp-redis"],
      "env": {
        "REDIS_URL": "YOUR_REDIS_URL"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN"
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

---

## Installation Steps

### Step 1: Install Node.js (if not already)
MCP servers require Node.js 18+

### Step 2: Install MCP Servers Globally

```bash
# Install all required MCP servers
npm install -g @supabase/mcp-server
npm install -g @redis/mcp-redis
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-fetch
```

### Step 3: Configure Claude Desktop

1. Open Claude Desktop settings
2. Go to Developer → Edit Config
3. Paste the configuration above
4. Replace placeholder values with your credentials
5. Save and restart Claude Desktop

### Step 4: Verify MCP Servers

In Claude Desktop, you should see MCP server indicators showing:
- ✅ Connected servers (green)
- ⚠️ Configuration needed (yellow)
- ❌ Failed servers (red)

---

## What You Need to Provide

To configure all MCP servers, I need:

### 1. Supabase Credentials
```
SUPABASE_URL: https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY: eyJhbGci...
```

### 2. Redis URL
```
REDIS_URL: redis://default:password@host:port
```

### 3. GitHub Token (Optional)
```
GITHUB_PERSONAL_ACCESS_TOKEN: ghp_xxxxx
```

---

## Benefits of Using MCP Servers

### With MCP Servers ✅
1. I can directly query your Supabase database
2. I can test Redis cache operations
3. I can verify database schema
4. I can create tables and migrations
5. I can download Bible data automatically
6. I can manage Git repository
7. I can read/write project files safely

### Without MCP Servers ❌
1. You must manually run SQL queries
2. You must manually test Redis
3. You must manually verify schema
4. You must manually create tables
5. You must manually download data
6. You must manually manage Git
7. Limited file access

---

## Security Best Practices

### ✅ DO:
- Use read-only mode for production databases
- Limit filesystem access to project directory
- Use environment variables for credentials
- Restart Claude Desktop after config changes
- Test with development data first

### ❌ DON'T:
- Connect to production databases with write access
- Share MCP config files with credentials
- Allow unrestricted filesystem access
- Use production API keys for testing

---

## Testing MCP Servers

After configuration, test each server:

### Test Supabase
```
Ask me: "List all tables in my Supabase database"
Expected: I should list user_profiles, sermons, etc.
```

### Test Redis
```
Ask me: "Check Redis connection and show stats"
Expected: Connection status and current key count
```

### Test Filesystem
```
Ask me: "List all .ts files in src/services/"
Expected: List of TypeScript service files
```

### Test GitHub (if configured)
```
Ask me: "Show current Git branch"
Expected: Current branch name
```

---

## Alternative: Manual Credentials Sharing

If you prefer not to configure MCP servers:

1. **Create all accounts** (Supabase, Redis, OpenAI)
2. **Copy credentials** to a secure note
3. **Share securely** via encrypted method
4. **I'll configure** .env files manually

---

## Next Steps

### Option A: Configure MCP Servers (Recommended)
1. Follow installation steps above
2. Add credentials to MCP config
3. Restart Claude Desktop
4. I can proceed with automated setup

### Option B: Manual Setup
1. Follow CREDENTIALS_SETUP.md
2. Manually create accounts
3. Share credentials
4. I'll help configure

---

## Sources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [Redis MCP Blog](https://redis.io/blog/introducing-model-context-protocol-mcp-for-redis/)
- [Redis MCP GitHub](https://github.com/redis/mcp-redis)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
- [MCP Registry](https://registry.modelcontextprotocol.io/)
- [OpenAI MCP Documentation](https://platform.openai.com/docs/mcp)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)

---

**MCP Setup Status**: ⏳ Awaiting Configuration
**Benefit**: Automated, efficient, direct service access
**Your Choice**: MCP servers OR manual setup
