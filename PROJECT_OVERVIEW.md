# Mandir App - Project Overview

> **Last Updated**: December 8, 2025
> **Status**: In Development (Phase 1 - Project Setup)

---

## Table of Contents
1. [Project Summary](#project-summary)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features Overview](#features-overview)
5. [User Flows](#user-flows)
6. [Data Model](#data-model)
7. [Design System](#design-system)
8. [Development Phases](#development-phases)
9. [Setup Instructions](#setup-instructions)
10. [Environment Variables](#environment-variables)
11. [Costs & Services](#costs--services)

---

## Project Summary

**Mandir** is a member management and check-in system for religious organizations.

### Core Functionality
- **Mobile App** (iOS + Android): Members display unique QR codes for check-in
- **Web Dashboard**: Front desk staff register members, scan QR codes, view member info
- **Family Groups**: Members can link family members together

### Future Expansion
- Multi-tenancy support for multiple organizations
- Architecture designed for code reuse across organizations

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile App** | React Native + Expo | Cross-platform iOS/Android app |
| **Web Dashboard** | Next.js (React) | Admin interface for front desk |
| **Backend** | Supabase | Database, Auth, Storage, API |
| **Database** | PostgreSQL | Relational data storage |
| **Auth** | Supabase Auth | Email/password + Phone OTP |
| **Storage** | Supabase Storage | Member photos |
| **QR Generation** | react-native-qrcode-svg | Generate member QR codes |
| **QR Scanning** | expo-camera | Scan QR codes at front desk |

---

## Project Structure

```
MandirApp/
├── PROJECT_OVERVIEW.md          # This file
├── mobile/                      # React Native + Expo app
│   ├── app/                     # Expo Router pages
│   │   ├── (auth)/              # Auth screens (login, verify)
│   │   ├── (tabs)/              # Main app tabs (home, family, settings)
│   │   └── _layout.tsx          # Root layout
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── constants/           # Theme, colors, config
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Supabase client, utilities
│   │   └── types/               # TypeScript types
│   ├── assets/                  # Images, fonts
│   ├── app.json                 # Expo configuration
│   └── package.json
├── web/                         # Next.js admin dashboard
│   ├── app/                     # Next.js App Router pages
│   ├── components/              # UI components
│   ├── lib/                     # Supabase client, utilities
│   └── package.json
└── shared/                      # Shared types (optional)
```

---

## Features Overview

### Mobile App (Member-Facing)

| Feature | Description | Priority |
|---------|-------------|----------|
| Phone Verification | Enter phone → receive OTP → verify membership | P0 |
| Profile Setup | Add photo (required), email, complete profile | P0 |
| QR Code Display | Large, scannable QR code on home screen | P0 |
| Family Management | Add/view family members, send invites | P0 |
| Settings | Edit profile, preferences | P1 |
| Check-in History | View past visits (nice-to-have) | P2 |

### Web Dashboard (Front Desk)

| Feature | Description | Priority |
|---------|-------------|----------|
| New Member Registration | Enter name, phone → record payment → send SMS | P0 |
| QR Scanner | Camera view → scan QR → display member info | P0 |
| Member Lookup | Search by name/phone | P0 |
| Member Directory | List all members, filter, search | P1 |
| Payment History | View payment records | P1 |
| Analytics | Check-in stats, member growth (future) | P2 |

---

## User Flows

### Flow 1: New Member Registration (Front Desk)

```
1. Person visits organization for first time
2. Goes to front desk, requests membership
3. Front desk enters: Name, Phone Number
4. Person pays membership dues (check/cash)
5. Front desk records payment in system
6. System sends SMS with app download link
7. Person downloads app, enters phone number
8. System recognizes them as member (status: pending_registration)
9. Person completes profile: photo, email, etc.
10. Person now has QR code, status: active
```

### Flow 2: Adding Family Members

```
INDEPENDENT MEMBER (has phone, wants own QR):
1. Prime member goes to Family tab
2. Taps "Invite Family Member"
3. Enters: Name, Phone, Relationship
4. System sends SMS invite to family member
5. Family member downloads app, verifies phone
6. Family member completes their profile
7. They now have their own QR code, linked to family

DEPENDENT MEMBER (no phone/minor/senior):
1. Prime member goes to Family tab
2. Taps "Add Dependent"
3. Enters: Name, Relationship
4. Takes photo of dependent
5. Dependent appears on prime member's QR scan
6. Dependent can be converted to independent later
```

### Flow 3: Check-In (Regular Visit)

```
1. Member arrives at organization
2. Opens Mandir app
3. QR code is displayed prominently on home screen
4. Front desk scans QR code
5. Dashboard shows:
   - Member photo, name, membership date
   - Family members with photos
   - "Check In" button
6. Front desk taps "Check In"
7. Visit is recorded
```

---

## Data Model

### Tables

```sql
-- Organizations (for future multi-tenancy)
organizations
├── id (uuid, primary key)
├── name (text)
├── slug (text, unique)
├── logo_url (text)
├── settings (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Family Groups
family_groups
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── prime_member_id (uuid, foreign key → members)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Members
members
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── family_group_id (uuid, foreign key)
├── phone (text, unique per org, nullable for dependents)
├── email (text, nullable)
├── first_name (text)
├── last_name (text)
├── photo_url (text)
├── is_prime_member (boolean, default false)
├── is_independent (boolean, default true)
├── relationship_to_prime (text: self, spouse, child, parent, in_law, sibling, other)
├── qr_token (uuid, unique, only for independent members)
├── status (text: pending_invite, pending_registration, active, inactive)
├── membership_date (date)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Payments
payments
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── family_group_id (uuid, foreign key)
├── member_id (uuid, foreign key → who paid)
├── amount (decimal)
├── payment_date (date)
├── payment_method (text: check, cash, card, other)
├── recorded_by (uuid, foreign key → staff member)
├── notes (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)

-- Check-ins
check_ins
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── member_id (uuid, foreign key)
├── checked_in_by (uuid, foreign key → staff)
├── checked_in_at (timestamp)
└── notes (text, nullable)

-- Staff (front desk users)
staff
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── user_id (uuid, foreign key → auth.users)
├── name (text)
├── email (text)
├── role (text: admin, staff)
├── is_active (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### Member Status Flow

```
pending_invite      → Front desk created, SMS sent, not yet registered
pending_registration → Phone verified, profile incomplete
active              → Fully registered, has QR code
inactive            → Membership expired or deactivated
```

### Relationship Types

```
self        → Prime member themselves
spouse      → Husband/wife
child       → Son/daughter (any age)
parent      → Mother/father
in_law      → Mother-in-law, father-in-law, etc.
sibling     → Brother/sister
other       → Other relation
```

---

## Design System

### Color Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Maroon** (Primary) | `#4A2040` | 74, 32, 64 | Headers, primary buttons, brand |
| **Plum** (Secondary) | `#6B3050` | 107, 48, 80 | Secondary buttons, accents |
| **Cream** | `#F5E6DC` | 245, 230, 220 | Card backgrounds, surfaces |
| **Soft Rose** | `#D4A89A` | 212, 168, 154 | Borders, subtle highlights |
| **Off-White** | `#FDF8F5` | 253, 248, 245 | App background |
| **Dark Text** | `#2D1A24` | 45, 26, 36 | Primary text |
| **Light Text** | `#FFFFFF` | 255, 255, 255 | Text on dark backgrounds |
| **Success** | `#4A7C59` | 74, 124, 89 | Success states, verified |
| **Warning** | `#D4A03E` | 212, 160, 62 | Warning states |
| **Error** | `#C45B4A` | 196, 91, 74 | Error states |

### Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| H1 | System | 32px | Bold | Screen titles |
| H2 | System | 24px | SemiBold | Section headers |
| H3 | System | 20px | SemiBold | Card titles |
| Body | System | 16px | Regular | Body text |
| Body Small | System | 14px | Regular | Secondary text |
| Caption | System | 12px | Regular | Labels, hints |
| Button | System | 16px | SemiBold | Button text |

### Spacing

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Component padding |
| md | 16px | Section spacing |
| lg | 24px | Screen padding |
| xl | 32px | Large gaps |
| xxl | 48px | Hero sections |

### Border Radius

| Name | Value | Usage |
|------|-------|-------|
| sm | 8px | Buttons, inputs |
| md | 12px | Cards |
| lg | 16px | Modals |
| full | 9999px | Circular avatars |

---

## Development Phases

### Phase 1: Project Setup (Current)
- [x] Create project structure
- [x] Initialize React Native + Expo
- [ ] Create design system constants
- [ ] Set up expo-router navigation
- [ ] Initialize Next.js web dashboard
- [ ] Set up Supabase project
- [ ] Create database schema

### Phase 2: Authentication & Core
- [ ] Supabase phone auth integration
- [ ] Member phone verification flow
- [ ] Profile setup screen
- [ ] Photo upload functionality
- [ ] QR code generation

### Phase 3: Family Management
- [ ] Family member list view
- [ ] Add independent family member (send invite)
- [ ] Add dependent family member (take photo)
- [ ] Family relationship management

### Phase 4: Front Desk Dashboard
- [ ] Staff authentication
- [ ] New member registration form
- [ ] QR code scanner
- [ ] Member info display on scan
- [ ] Check-in recording

### Phase 5: Polish & Launch
- [ ] Payment tracking
- [ ] Check-in history
- [ ] UI/UX refinements
- [ ] Error handling
- [ ] Testing
- [ ] App Store / Play Store submission

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Xcode (for iOS development on Mac)
- Android Studio (for Android development)
- Expo Go app on your phone (for testing)

### Mobile App Setup

```bash
cd MandirApp/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go app to run on your device.

### Web Dashboard Setup

```bash
cd MandirApp/web
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Supabase Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a new project named "Mandir"
3. Copy the project URL and anon key
4. Add to environment variables (see below)
5. Run the SQL schema in the SQL editor

---

## Environment Variables

### Mobile App (`mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Web Dashboard (`web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Costs & Services

### One-Time Costs
| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Google Play Developer | $25 one-time |

### Monthly Costs (Estimated)
| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| Supabase | 50K MAU, 500MB DB, 1GB storage | $25/mo |
| Expo EAS | 30 builds/month | $99/mo |
| Vercel (web hosting) | Generous free tier | $20/mo |
| Domain | - | ~$12/year |
| Twilio (SMS) | - | ~$0.01/SMS |

### First Year Estimate
~$250-400 total (mostly Apple/Google fees)

---

## Quick Reference

### Key Files
- `mobile/src/constants/theme.ts` - Colors, typography, spacing
- `mobile/src/lib/supabase.ts` - Supabase client
- `mobile/app/_layout.tsx` - Root navigation layout
- `web/lib/supabase.ts` - Web Supabase client

### Useful Commands
```bash
# Start mobile app
cd mobile && npx expo start

# Start web dashboard
cd web && npm run dev

# Build mobile app
cd mobile && npx eas build

# Run on iOS simulator
cd mobile && npx expo start --ios

# Run on Android emulator
cd mobile && npx expo start --android
```

### Testing
- Use Expo Go app on your physical device for fastest iteration
- Scan the QR code from terminal after running `npx expo start`

---

## Notes & Decisions

1. **Why React Native over Flutter?** - Code sharing with Next.js web dashboard (JavaScript/TypeScript ecosystem)

2. **Why Supabase over Firebase?** - PostgreSQL better for relational data (family relationships), predictable pricing, better for multi-tenancy

3. **Why phone auth?** - Primary identifier for members, easier for non-tech-savvy users, front desk collects phone numbers

4. **Dependent vs Independent members** - Allows flexibility for families where some members have phones and some don't

---

*This document should be updated as the project evolves.*
