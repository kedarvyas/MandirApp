# MCP & Skills Guide for Sanctum Mobile

This document tells Claude when and how to use the available MCPs (Model Context Protocol servers) and Skills for this project. **Claude should reference this guide throughout the session.**

---

## Available Skills (Slash Commands)

### `/test-auth-flow`
**When to use:** Testing the complete phone OTP authentication flow
**How:** Run the command, optionally with `--platform ios|android`, `--org-code`, `--phone`
**Example scenario:** "Let's verify the auth flow works end-to-end"

### `/deploy-ota`
**When to use:** Pushing over-the-air updates via Expo
**How:** Run the command after code changes that don't require a new build
**Example scenario:** "Deploy the bug fixes we just made"

### `/expo-build`
**When to use:** Creating production builds for iOS/Android via EAS
**How:** Run the command with platform and profile options
**Example scenario:** "Build a preview version for testing"

### `/sync-types`
**When to use:** After database schema changes in Supabase
**How:** Run the command to regenerate TypeScript types
**Example scenario:** "I added a new column to the members table"

### `/react-native-expert`
**When to use:** Need guidance on RN patterns, performance, or architecture
**How:** Run when writing new components or reviewing code
**Example scenario:** "How should I structure this new screen?"

### `/mobile-debugging`
**When to use:** Troubleshooting build errors, runtime crashes, or unexpected behavior
**How:** Run when stuck on an issue to get structured debugging steps
**Example scenario:** "The app crashes on startup" or "Metro bundler won't start"

### `/expo-configuration`
**When to use:** Configuring app.json, eas.json, or environment variables
**How:** Run when setting up builds, OTA updates, or native modules
**Example scenario:** "How do I configure push notifications?"

### `/ui-ux-design`
**When to use:** Designing new screens, reviewing layouts, or ensuring accessibility
**How:** Run when creating UI or discussing design decisions
**Example scenario:** "Design the check-in history screen"

---

## Available MCPs

### Supabase MCP
**Tools available:**
- `mcp__supabase__execute_sql` - Run queries directly
- `mcp__supabase__apply_migration` - Create database migrations
- `mcp__supabase__list_tables` - View table structure
- `mcp__supabase__generate_typescript_types` - Generate types
- `mcp__supabase__get_logs` - View service logs (api, auth, postgres, etc.)
- `mcp__supabase__get_advisors` - Check security/performance issues
- `mcp__supabase__search_docs` - Search Supabase documentation
- `mcp__supabase__deploy_edge_function` - Deploy serverless functions

**When to use:**
- Checking database structure: "What columns does the members table have?"
- Running queries: "How many active members are there?"
- Creating migrations: "Add a new `notes` column to check_ins"
- Debugging: "Check the auth logs for errors"
- Security: "Are there any security warnings?"
- Generating types: "Regenerate the TypeScript types"

**Example prompts that trigger Supabase MCP:**
- "Check the database schema"
- "Run this SQL query..."
- "Create a migration to add..."
- "What's in the Supabase logs?"
- "Check for security issues"

---

### GitHub MCP
**Tools available:**
- `mcp__github__create_pull_request` - Create PRs
- `mcp__github__list_issues` / `mcp__github__get_issue` - View issues
- `mcp__github__create_issue` - Create issues
- `mcp__github__search_code` - Search code in repos
- `mcp__github__get_pull_request` - View PR details
- `mcp__github__list_commits` - View commit history

**When to use:**
- Creating PRs after feature work
- Checking open issues
- Searching for code patterns across repos
- Reviewing PR status

**Example prompts:**
- "Create a PR for these changes"
- "What issues are open?"
- "Search for how other repos handle..."

---

### Puppeteer MCP
**Tools available:**
- `mcp__puppeteer__puppeteer_launch` - Start browser
- `mcp__puppeteer__puppeteer_navigate` - Go to URL
- `mcp__puppeteer__puppeteer_screenshot` - Capture screenshots
- `mcp__puppeteer__puppeteer_click` / `puppeteer_type` - Interact with pages

**When to use:**
- Testing the web dashboard (not mobile app)
- Capturing screenshots of web pages
- Automating web interactions

**Example prompts:**
- "Take a screenshot of the dashboard"
- "Test the web login flow"

---

### Figma MCP (Needs Authentication)
**Tools:** Read Figma designs, extract design tokens

**When to use:**
- Converting Figma mockups to React Native code
- Extracting colors, spacing, typography from designs
- Building pixel-perfect UI from mockups

**Example prompts:**
- "Convert this Figma frame to a React Native component"
- "What colors are used in this design?"

**Note:** Will prompt for authentication on first use.

---

### Expo MCP (Needs Authentication)
**Tools:**
- `learn` - Expo SDK guidance
- `search_documentation` - Search Expo docs
- `add_library` - Install packages correctly
- `automation_take_screenshot` - Capture simulator screenshots
- `automation_tap` - Simulate taps for testing

**When to use:**
- Installing Expo packages
- Understanding Expo SDK features
- Automated testing on simulators (iOS only)

**Example prompts:**
- "How do I use expo-camera?"
- "Install the haptics library"
- "Take a screenshot of the simulator"

**Note:** Requires EAS authentication. Run `/mcp` to authenticate.

---

## Quick Reference: When to Suggest Tools

| User Request | Tool to Use |
|--------------|-------------|
| "Check the database..." | Supabase MCP |
| "What's the schema for..." | `mcp__supabase__list_tables` |
| "Run this query..." | `mcp__supabase__execute_sql` |
| "Add a column/table..." | `mcp__supabase__apply_migration` |
| "Any security issues?" | `mcp__supabase__get_advisors` |
| "Create a PR..." | GitHub MCP |
| "Test the auth flow" | `/test-auth-flow` skill |
| "Deploy an update" | `/deploy-ota` skill |
| "Build for iOS/Android" | `/expo-build` skill |
| "Sync types from DB" | `/sync-types` skill |
| "How should I structure..." | `/react-native-expert` skill |
| "The app is crashing..." | `/mobile-debugging` skill |
| "Configure app.json..." | `/expo-configuration` skill |
| "Design this screen..." | `/ui-ux-design` skill |
| "Screenshot the web app" | Puppeteer MCP |
| "Convert this Figma..." | Figma MCP |

---

## Important Notes

1. **Always mention when using an MCP** - Tell the user: "I'll use the Supabase MCP to check this..."

2. **Skills are invoked with slash commands** - Run `/skill-name` to activate

3. **Some MCPs need auth** - Expo and Figma MCPs require authentication on first use

4. **Prefer MCPs over manual work** - Use `mcp__supabase__execute_sql` instead of asking user to run queries manually

5. **Check this guide** when user asks about databases, deployments, builds, or design
