@echo off
echo ========================================
echo Installing MCP Servers for MediVIX
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/7] Installing Node.js-based MCP Servers...
echo.

echo Installing PostgreSQL server...
call npm install -g @modelcontextprotocol/server-postgres
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install PostgreSQL server
) else (
    echo PostgreSQL server installed successfully
)
echo.

echo Installing Brave Search server...
call npm install -g @modelcontextprotocol/server-brave-search
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install Brave Search server
) else (
    echo Brave Search server installed successfully
)
echo.

echo Installing Memory server...
call npm install -g @modelcontextprotocol/server-memory
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install Memory server
) else (
    echo Memory server installed successfully
)
echo.

echo Installing Sequential Thinking server...
call npm install -g @modelcontextprotocol/server-sequential-thinking
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install Sequential Thinking server
) else (
    echo Sequential Thinking server installed successfully
)
echo.

echo [2/7] Installing Python-based MCP Servers...
echo.

echo Installing Time server...
pip install mcp-server-time
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install Time server
) else (
    echo Time server installed successfully
)
echo.

echo Installing Fetch server...
pip install mcp-server-fetch
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install Fetch server
) else (
    echo Fetch server installed successfully
)
echo.

echo Installing SQLite server...
pip install mcp-server-sqlite
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Failed to install SQLite server
) else (
    echo SQLite server installed successfully
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Get a Brave Search API key from https://api.search.brave.com/
echo 2. Configure the Claude Desktop config file
echo 3. Add API keys to your .env.local file
echo.
pause