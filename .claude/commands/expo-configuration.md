# Expo Configuration

Expert guidance for Expo and EAS configuration.

## Configuration Files Overview

### app.json / app.config.ts
Primary Expo configuration file.

```typescript
// app.config.ts - Dynamic configuration
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Sanctum",
  slug: "sanctum",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "sanctum",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#FDF8F5"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.sanctum.mobile",
    infoPlist: {
      NSCameraUsageDescription: "Sanctum needs camera access to scan QR codes for check-in"
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#4A2040"
    },
    package: "com.sanctum.mobile",
    permissions: ["CAMERA"]
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: "your-project-id"
    }
  },
  plugins: [
    "expo-router",
    "expo-camera",
    [
      "expo-image-picker",
      {
        photosPermission: "Allow Sanctum to access your photos for profile pictures"
      }
    ]
  ]
});
```

### eas.json
EAS Build and Submit configuration.

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "123456789"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "internal"
      }
    }
  }
}
```

## Environment Variables

### Local Development
Create `.env` file (gitignored):
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
```

### EAS Builds
```bash
# Set secrets for EAS
eas secret:create --name SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name SUPABASE_ANON_KEY --value "eyJxxx"
```

Access in app.config.ts:
```typescript
extra: {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
}
```

## Common Plugins Configuration

### expo-router
```json
{
  "plugins": [
    [
      "expo-router",
      {
        "origin": "https://sanctum.app"
      }
    ]
  ]
}
```

### expo-camera
```json
{
  "plugins": [
    [
      "expo-camera",
      {
        "cameraPermission": "Allow Sanctum to use the camera for QR code check-in"
      }
    ]
  ]
}
```

### expo-notifications (if needed)
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#4A2040"
      }
    ]
  ]
}
```

## Build Profiles

### Development Build
For testing with dev tools:
```bash
npx eas build --profile development --platform ios
```

### Preview Build
For internal testing:
```bash
npx eas build --profile preview --platform all
```

### Production Build
For app store submission:
```bash
npx eas build --profile production --platform all
```

## OTA Updates Configuration

```json
// In app.json
{
  "updates": {
    "enabled": true,
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/your-project-id"
  },
  "runtimeVersion": {
    "policy": "appVersion"
  }
}
```

Deploy update:
```bash
npx eas update --branch production --message "Bug fixes"
```

## Platform-Specific Settings

### iOS
```typescript
ios: {
  bundleIdentifier: "com.sanctum.mobile",
  buildNumber: "1",
  supportsTablet: true,
  infoPlist: {
    NSCameraUsageDescription: "...",
    NSPhotoLibraryUsageDescription: "...",
    UIBackgroundModes: ["remote-notification"]
  },
  entitlements: {
    "aps-environment": "production"
  }
}
```

### Android
```typescript
android: {
  package: "com.sanctum.mobile",
  versionCode: 1,
  adaptiveIcon: {
    foregroundImage: "./assets/adaptive-icon.png",
    backgroundColor: "#4A2040"
  },
  permissions: [
    "CAMERA",
    "VIBRATE"
  ],
  googleServicesFile: "./google-services.json"
}
```

## Troubleshooting Config Issues

**"Invariant violation: No scheme"**
- Add `scheme` to app.json

**"Missing iOS bundle identifier"**
- Add `ios.bundleIdentifier` to app.json

**"Plugin not found"**
```bash
npx expo install expo-plugin-name
```

**"Config validation failed"**
```bash
npx expo config --type introspect
```

## Sanctum-Specific Config

Required plugins for Sanctum mobile:
- `expo-router` - Navigation
- `expo-camera` - QR scanning
- `expo-image-picker` - Profile photos
- `expo-secure-store` - Token storage
- `expo-haptics` - Feedback on check-in
