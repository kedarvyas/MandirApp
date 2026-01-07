# Sanctum - Bug Tracker

This document tracks known bugs, issues, and technical debt. Update this file as bugs are found and fixed.

---

## Critical Issues (Blocking)

_None currently identified_

---

## Errors (Must Fix)

_No open errors - all have been resolved_

---

## Warnings (Should Fix)

_No open warnings - all have been resolved_

---

## Technical Debt

### DEBT-001: No test suite configured
- **Description:** Project has no automated tests set up
- **Impact:** No automated regression testing
- **Recommendation:** Set up Jest/Vitest for unit tests, consider Playwright for E2E
- **Status:** Open

### DEBT-002: Staff roles migration not applied
- **Description:** `002_expand_staff_roles.sql` migration may not be applied to production
- **Impact:** New role permissions won't work until applied
- **Action:** Verify migration status in Supabase
- **Status:** Needs Verification

---

## Manual Testing Checklist

### Web Dashboard
- [ ] Login with email/password
- [ ] View dashboard stats
- [ ] View/search members list
- [ ] View member detail page
- [ ] Add new member
- [ ] Record payment
- [ ] Check-in flow
- [ ] Settings page loads
- [ ] Kiosk configuration saves
- [ ] Logout works

### Mobile App
- [ ] Org code entry
- [ ] Phone OTP login
- [ ] OTP verification
- [ ] Profile setup (with photo)
- [ ] QR code displays
- [ ] QR code can be scanned
- [ ] View family members
- [ ] Add family member
- [ ] Edit profile
- [ ] Switch organizations (if applicable)
- [ ] Logout works

### Kiosk (iPad)
- [ ] Load kiosk page with org code
- [ ] Display preset amounts from settings
- [ ] Custom amount input works
- [ ] Payment method selection
- [ ] Thank you screen displays
- [ ] Auto-reset after donation

---

## Fixed Bugs (Archive)

### WEB-001: Impure function call in dashboard
- **File:** `web/src/app/dashboard/page.tsx`
- **Fix:** Cached Date object before calculating time boundaries
- **Fixed:** 2026-01-04

### WEB-002: Unescaped apostrophe in MobileAppPreview
- **File:** `web/src/components/landing/MobileAppPreview.tsx:105`
- **Fix:** Changed `doesn't` to `doesn&apos;t`
- **Fixed:** 2026-01-04

### MOB-001: TypeScript ref callback error in verify.tsx
- **File:** `mobile/app/(auth)/verify.tsx:181`
- **Fix:** Changed arrow function to use block syntax `{ }` instead of implicit return
- **Fixed:** 2026-01-04

### WEB-003: Unused variable in donate page
- **File:** `web/src/app/kiosk/[org_code]/donate/page.tsx`
- **Fix:** Added eslint-disable comment (intentionally unused for future payment integration)
- **Fixed:** 2026-01-04

### WEB-004: Using `<img>` instead of Next.js Image in donate page
- **File:** `web/src/app/kiosk/[org_code]/donate/page.tsx`
- **Fix:** Replaced with `next/image` Image component with `unoptimized` for external URLs
- **Fixed:** 2026-01-04

### WEB-005: Using `<img>` instead of Next.js Image in nav
- **File:** `web/src/components/dashboard/nav.tsx`
- **Fix:** Replaced with `next/image` Image component with `unoptimized` for external URLs
- **Fixed:** 2026-01-04

---

Last Updated: 2026-01-04
