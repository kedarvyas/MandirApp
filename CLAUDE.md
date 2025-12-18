# MandirApp - Project Context for Claude

## Project Overview
MandirApp is a B2B SaaS member check-in system for religious organizations (temples, churches, mosques, gurdwaras, synagogues). Organizations sign up via web, get a unique org code, and their members use the mobile app to check in via QR codes.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Mobile | React Native + Expo SDK 54, expo-router, TypeScript |
| Web | Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage) |
| Auth | Phone OTP (mobile/members), Email/Password (web/staff) |

## Project Structure
```
/MandirApp
├── mobile/          # React Native Expo app (member-facing)
│   ├── app/         # expo-router screens
│   └── src/         # components, lib, types, constants
├── web/             # Next.js dashboard (staff-facing + marketing)
│   └── src/         # app router, components, lib, types
└── supabase/        # Database schema and migrations
    ├── schema.sql   # Full schema (run on fresh DB)
    └── migrations/  # Incremental migrations
```

## Common Commands

### Web App
```bash
cd web && npm run dev      # Start dev server (localhost:3000)
cd web && npm run build    # Production build
cd web && npm run lint     # Run ESLint
```

### Mobile App
```bash
cd mobile && npx expo start          # Start Expo dev server
cd mobile && npx expo start --ios    # iOS simulator
cd mobile && npx expo start --android # Android emulator
cd mobile && npx expo install <pkg>  # Install Expo-compatible package
```

### Database
```bash
# Run migrations in Supabase SQL Editor
# Schema: supabase/schema.sql
# Migrations: supabase/migrations/*.sql
```

## Theme Colors
```
Primary (Maroon):  #4A2040 / rgb(74, 32, 64)
Secondary (Plum):  #6B3050
Background:        #FDF8F5
Card (Cream):      #F5E6DC
Text (Dark):       #2D1A24
Accent (Rose):     #D4A89A
Success:           #4A7C59
Warning:           #D4A03E
Error:             #C45B4A
```

## Key Files
- `supabase/schema.sql` - Database schema (source of truth)
- `web/src/types/database.ts` - TypeScript types for web
- `mobile/src/types/database.ts` - TypeScript types for mobile
- `mobile/src/constants/theme.ts` - Mobile theme values
- `web/src/app/globals.css` - Web CSS variables and theme

## Database Tables
- `organizations` - Multi-tenant orgs with `org_code` for mobile login
- `members` - Users with QR tokens, family relationships
- `family_groups` - Groups members into families
- `staff` - Admin/staff users for web dashboard
- `check_ins` - Attendance records
- `payments` - Donation/payment records

## Current Status: B2B Pivot
**Completed:**
- [x] Database: org_code column, generate_org_code(), RLS policies
- [x] Marketing: Landing page (/), Pricing page (/pricing)
- [x] Signup: Organization onboarding flow (/signup)

**Next:**
- [ ] Mobile: Org code entry screen before phone auth
- [ ] Dashboard: Org context/selector, scoped queries

## Code Conventions
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over .then()
- Components: PascalCase, files: kebab-case or PascalCase
- Mobile uses `useFocusEffect` for screen refresh
- Image uploads: base64 with `decode()` from base64-arraybuffer

## Testing Notes
- No test suite set up yet (opportunity for TDD)
- Manual testing via Expo Go (mobile) and browser (web)

---

# Best Practices for This Project

## When to Suggest `/clear`
- After completing a major feature or phase
- When switching between mobile and web work
- If context feels cluttered after many file edits

## When to Suggest Parallel Claude Workflows
- Code review: One Claude writes, another reviews
- Large migrations: Fan out across multiple instances
- Testing: One writes tests, another implements

## When to Push Back / Ask Questions
- Vague requests like "add tests" → Ask: which components? edge cases?
- "Make it better" → Ask: performance? UX? code quality?
- New features → Suggest planning first, confirm approach

## When to Suggest TDD
- New utility functions or hooks
- API endpoints or database functions
- Complex business logic

## Extended Thinking Keywords
- "think" → Standard extended reasoning
- "think hard" → More computation for complex problems
- "ultrathink" → Maximum reasoning for architecture decisions

## Checklist Approach
For large tasks (migrations, multi-file refactors), maintain a markdown checklist and work through systematically.
