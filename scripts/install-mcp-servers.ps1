# MCP Server Installation Script for MediVIX (PowerShell Version)
# Run as Administrator: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing MCP Servers for MediVIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[1/7] Installing Node.js-based MCP Servers..." -ForegroundColor Yellow
Write-Host ""

# Install Node.js MCP Servers
$nodeServers = @(
    @{Name="PostgreSQL"; Package="@modelcontextprotocol/server-postgres"},
    @{Name="Brave Search"; Package="@modelcontextprotocol/server-brave-search"},
    @{Name="Memory"; Package="@modelcontextprotocol/server-memory"},
    @{Name="Sequential Thinking"; Package="@modelcontextprotocol/server-sequential-thinking"}
)

foreach ($server in $nodeServers) {
    Write-Host "Installing $($server.Name) server..." -ForegroundColor Cyan
    try {
        npm install -g $server.Package 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$($server.Name) server installed successfully" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Failed to install $($server.Name) server" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "WARNING: Error installing $($server.Name) server" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "[2/7] Installing Python-based MCP Servers..." -ForegroundColor Yellow
Write-Host ""

# Install Python MCP Servers
$pythonServers = @(
    @{Name="Time"; Package="mcp-server-time"},
    @{Name="Fetch"; Package="mcp-server-fetch"},
    @{Name="SQLite"; Package="mcp-server-sqlite"}
)

foreach ($server in $pythonServers) {
    Write-Host "Installing $($server.Name) server..." -ForegroundColor Cyan
    try {
        pip install $server.Package 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$($server.Name) server installed successfully" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Failed to install $($server.Name) server" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "WARNING: Error installing $($server.Name) server" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Get a Brave Search API key from https://api.search.brave.com/" -ForegroundColor White
Write-Host "2. Configure the Claude Desktop config file" -ForegroundColor White
Write-Host "3. Add API keys to your .env.local file" -ForegroundColor White
Write-Host ""

# Offer to copy configuration file
$copyConfig = Read-Host "Would you like to copy the config to Claude Desktop now? (y/n)"
if ($copyConfig -eq 'y') {
    $claudeConfigPath = "$env:APPDATA\Claude"

    # Create directory if it doesn't exist
    if (!(Test-Path $claudeConfigPath)) {
        New-Item -ItemType Directory -Path $claudeConfigPath -Force | Out-Null
        Write-Host "Created Claude config directory" -ForegroundColor Green
    }

    # Copy configuration file
    $sourceConfig = Join-Path $PSScriptRoot "..\config\claude_desktop_config.json"
    $destConfig = Join-Path $claudeConfigPath "claude_desktop_config.json"

    if (Test-Path $sourceConfig) {
        Copy-Item $sourceConfig $destConfig -Force
        Write-Host "Configuration copied to $destConfig" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Edit the config file to add your API keys!" -ForegroundColor Yellow
    } else {
        Write-Host "Config file not found at $sourceConfig" -ForegroundColor Red
    }
}

Read-Host "Press Enter to exit"