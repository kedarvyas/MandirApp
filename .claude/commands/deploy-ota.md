# Deploy OTA Update

Push an over-the-air update to the Sanctum mobile app via EAS Update.

## Description
This skill deploys JavaScript/asset updates to the mobile app without requiring a full app store release. Uses Expo's EAS Update service for instant deployment.

## Arguments
- `--branch`: preview or production (required)
- `--message`: Update message/changelog (optional)

## Steps
1. **Pre-flight Checks**
   - Verify git working tree is clean
   - Confirm current branch matches target deployment
   - Check for any TypeScript errors

2. **Build Check**
   - Run `npx tsc --noEmit` in mobile directory
   - Ensure no compilation errors

3. **Deploy Update**
   ```bash
   cd mobile
   eas update --branch <branch> --message "<message>"
   ```

4. **Verification**
   - Confirm update was pushed successfully
   - Return update URL and update ID
   - Report affected runtime version

## Branches
- `preview`: For internal testing before production
- `production`: Live update to production users

## Prerequisites
- EAS CLI installed globally
- Logged into EAS account
- EAS Update configured in `eas.json`
- Compatible runtime version deployed

## Safety Notes
- Always test on preview branch before production
- OTA updates only work within same runtime version
- Native code changes require full app store update

## Example Usage
```
/deploy-ota --branch preview --message "Fix check-in QR display bug"
/deploy-ota --branch production --message "Performance improvements"
```
