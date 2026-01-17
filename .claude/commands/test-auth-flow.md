# Test Auth Flow

End-to-end test of the mobile authentication flow with screenshots.

## Description
This skill tests the complete authentication flow in the Sanctum mobile app, from org code entry to profile setup, capturing screenshots at each step for visual verification.

## Test Flow
1. **Welcome Screen**
   - Launch app in simulator
   - Verify welcome screen loads
   - Capture screenshot

2. **Org Code Entry** (`org-code.tsx`)
   - Navigate to org code screen
   - Enter test org code
   - Verify validation
   - Capture screenshot

3. **Phone Sign-In** (`phone.tsx`)
   - Enter test phone number
   - Submit for OTP
   - Capture screenshot

4. **OTP Verification** (`verify.tsx`)
   - Enter verification code
   - Submit verification
   - Capture screenshot

5. **Profile Setup** (`profile-setup.tsx`)
   - Complete profile form
   - Upload test avatar (optional)
   - Submit profile
   - Capture screenshot

6. **Home Screen** (`(tabs)/index.tsx`)
   - Verify QR code displays
   - Verify member info shows correctly
   - Capture final screenshot

## Arguments
- `--platform`: ios or android (default: ios)
- `--org-code`: Test org code to use
- `--phone`: Test phone number (format: +1234567890)

## Prerequisites
- Expo dev server running (`cd mobile && npx expo start`)
- Simulator/emulator available
- Expo MCP configured and connected
- Test organization created in database

## Output
- Screenshots saved to `mobile/test-screenshots/`
- Test report with pass/fail status for each step
