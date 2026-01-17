# Expo Build

Trigger an EAS build for the Sanctum mobile app.

## Description
This skill automates the process of creating builds for the mobile app using Expo Application Services (EAS). It handles iOS, Android, or both platforms with configurable profiles.

## Arguments
- `--platform`: ios, android, or all (default: all)
- `--profile`: development, preview, or production (default: preview)

## Steps
1. Verify the current git branch is clean (no uncommitted changes)
2. Navigate to the mobile directory
3. Run `eas build --platform <platform> --profile <profile>`
4. Monitor the build status and report progress
5. Return the build URL when complete

## Example Usage
```
/expo-build --platform ios --profile preview
/expo-build --platform all --profile production
```

## Prerequisites
- EAS CLI installed globally (`npm install -g eas-cli`)
- Logged into EAS (`eas login`)
- Project configured for EAS (`eas.json` in mobile directory)
