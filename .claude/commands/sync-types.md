# Sync TypeScript Types

Regenerate TypeScript types from Supabase schema and sync to both mobile and web apps.

## Description
This skill generates TypeScript type definitions from your Supabase database schema and updates both the mobile and web type files to ensure consistency across the codebase.

## Steps
1. Run Supabase type generation:
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types.ts
   ```
   Or use Supabase MCP to introspect the schema

2. Update mobile types file:
   - Target: `mobile/src/types/database.ts`
   - Preserve any custom type extensions

3. Update web types file:
   - Target: `web/src/types/database.ts`
   - Preserve any custom type extensions

4. Run TypeScript checks in both directories:
   ```bash
   cd mobile && npx tsc --noEmit
   cd web && npm run build
   ```

5. Report any breaking changes found

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Supabase project linked
- Valid Supabase credentials in environment

## Notes
- Always review generated types before committing
- Custom type extensions at bottom of files are preserved
- Breaking changes require manual intervention
