# MCP Server Setup Guide for MediVIX

## Overview

This guide will help you set up Model Context Protocol (MCP) servers to enhance MediVIX development with Claude Desktop. These servers provide direct database access, web search, persistent memory, and other capabilities.

## MCP Servers Included

1. **PostgreSQL** - Direct database access to Supabase
2. **Brave Search** - Medical research and web search
3. **Memory** - Persistent knowledge graph for patient context
4. **Time** - Timezone conversion for appointments
5. **Fetch** - Web content fetching for medical APIs
6. **SQLite** - Local database for offline development
7. **Sequential Thinking** - Complex medical workflow reasoning

## Installation Steps

### Step 1: Install MCP Servers

Run the installation script as Administrator:

```bash
cd C:\_dev\mediVIX
scripts\install-mcp-servers.bat
```

This will install all required Node.js and Python MCP servers globally.

### Step 2: Get API Keys

#### Brave Search API Key
1. Go to [https://api.search.brave.com/](https://api.search.brave.com/)
2. Sign up for a free account
3. Create an API key
4. Save the key for Step 4

### Step 3: Configure Claude Desktop

1. **Create the Claude config directory** (if it doesn't exist):
   ```
   mkdir %APPDATA%\Claude
   ```

2. **Copy the configuration file**:
   ```
   copy config\claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Edit the configuration** at `%APPDATA%\Claude\claude_desktop_config.json`:
   - Replace `YOUR_BRAVE_SEARCH_API_KEY` with your actual Brave Search API key
   - Update the PostgreSQL connection string to match your Supabase database

   For Supabase PostgreSQL connection:
   ```json
   "POSTGRES_CONNECTION_STRING": "postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   ```

   You can find your connection string in:
   - Supabase Dashboard → Settings → Database → Connection string

### Step 4: Update Environment Variables

Add the following to your `.env.local` file:

```env
# MCP Server Configuration
BRAVE_SEARCH_API_KEY=your-brave-search-api-key

# PostgreSQL Connection (for MCP server)
POSTGRES_CONNECTION_STRING=your-supabase-connection-string
```

### Step 5: Restart Claude Desktop

After configuration:
1. Completely close Claude Desktop
2. Restart Claude Desktop
3. The MCP servers should now be available

## Verifying Installation

To verify MCP servers are working:

1. Open Claude Desktop
2. Start a new conversation
3. Ask Claude to use one of the MCP tools
4. Check for any error messages

Example test commands:
- "Use the time server to get the current time"
- "Use the memory server to remember this: Patient John Doe has a penicillin allergy"
- "Use fetch to get the latest Next.js documentation"

## Usage Examples for MediVIX

### PostgreSQL - Complex Queries
```sql
-- Direct SQL queries to Supabase
-- Find patients with multiple appointments this month
SELECT p.*, COUNT(a.id) as appointment_count
FROM patients p
JOIN appointments a ON p.id = a.patient_id
WHERE a.start_time >= date_trunc('month', CURRENT_DATE)
GROUP BY p.id
HAVING COUNT(a.id) > 1;
```

### Brave Search - Medical Research
- Look up drug interactions
- Find latest medical guidelines
- Research symptoms and conditions
- Get ICD-10 codes

### Memory - Patient Context
- Remember patient allergies across sessions
- Track treatment preferences
- Maintain conversation context about specific patients

### Time - Appointment Scheduling
- Convert between timezones for telemedicine
- Calculate appointment durations
- Handle recurring appointments

### Fetch - External APIs
- Access drug databases
- Retrieve medical coding information
- Pull documentation from healthcare APIs

### SQLite - Local Development
- Test without Supabase connection
- Offline patient data access
- Quick prototyping

### Sequential Thinking - Complex Workflows
- Multi-step diagnosis processes
- Treatment plan generation
- Complex medical decision trees

## Troubleshooting

### Common Issues

1. **"Could not attach to MCP server" error**
   - Ensure you're using absolute paths in the config
   - Check that all servers are installed correctly
   - Try running Claude Desktop as Administrator

2. **"Command not found" errors**
   - Verify Node.js and Python are in your PATH
   - Re-run the installation script
   - Check the paths in `claude_desktop_config.json`

3. **PostgreSQL connection issues**
   - Verify your Supabase connection string
   - Check network connectivity
   - Ensure database is accessible

4. **Brave Search not working**
   - Verify API key is correct
   - Check API quota limits
   - Ensure key is properly set in config

### Getting Help

- Check server logs in Claude Desktop
- Review the [MCP documentation](https://modelcontextprotocol.io)
- File issues in the respective server repositories

## Security Notes

- **Never commit API keys** to version control
- Keep `.env.local` in `.gitignore`
- Use read-only database connections when possible
- Rotate API keys regularly
- Consider using environment-specific keys

## Next Steps

1. Test each MCP server individually
2. Integrate MCP capabilities into your workflow
3. Create custom prompts that leverage these tools
4. Document useful queries and patterns

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Claude Desktop Guide](https://claude.ai/desktop)
- [Brave Search API Docs](https://api.search.brave.com/docs)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)