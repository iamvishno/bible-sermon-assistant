@echo off
echo ================================================
echo Installing MCP Servers for Bible Sermon Assistant
echo ================================================
echo.

echo Installing Supabase MCP Server...
call npm install -g @supabase/mcp-server
echo.

echo Installing Redis MCP Server...
call npm install -g @redis/mcp-redis
echo.

echo Installing GitHub MCP Server...
call npm install -g @modelcontextprotocol/server-github
echo.

echo Installing Filesystem MCP Server...
call npm install -g @modelcontextprotocol/server-filesystem
echo.

echo Installing Fetch MCP Server...
call npm install -g @modelcontextprotocol/server-fetch
echo.

echo ================================================
echo MCP Servers Installation Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Create Supabase account at https://supabase.com
echo 2. Create Upstash Redis at https://upstash.com
echo 3. Configure Claude Desktop with credentials
echo.
pause
