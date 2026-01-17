# Mobile Debugging

Structured approach to debugging React Native and Expo issues.

## Debugging Workflow

### Step 1: Identify the Problem Category

**Build Errors**
- Metro bundler failures
- Native compilation (Xcode/Gradle)
- Dependency conflicts

**Runtime Errors**
- JavaScript exceptions
- Native crashes
- Network failures

**UI Issues**
- Layout/styling problems
- Performance (jank, slow renders)
- Platform-specific behavior

### Step 2: Gather Information

```bash
# Check Expo/RN versions
cd mobile && npx expo --version
cd mobile && npx react-native --version

# View Metro logs
cd mobile && npx expo start --clear

# Check for dependency issues
cd mobile && npx expo doctor

# iOS specific
cd mobile/ios && pod install --repo-update

# Android specific
cd mobile/android && ./gradlew clean
```

### Step 3: Common Issues & Solutions

#### Metro Bundler

**"Unable to resolve module"**
```bash
# Clear Metro cache
cd mobile && npx expo start --clear

# Reset node_modules
rm -rf mobile/node_modules
cd mobile && npm install
```

**Slow bundling**
- Check for large assets in bundle
- Verify no circular dependencies
- Use `@babel/plugin-transform-remove-console` for prod

#### iOS Build Errors

**Pod install failures**
```bash
cd mobile/ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

**Signing issues**
- Open Xcode, select team in Signing & Capabilities
- Ensure provisioning profile matches bundle ID

**"No such module" errors**
```bash
# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
cd mobile/ios && pod deintegrate && pod install
```

#### Android Build Errors

**Gradle sync failed**
```bash
cd mobile/android
./gradlew clean
./gradlew --stop
rm -rf .gradle
```

**SDK version mismatch**
- Check `android/build.gradle` for compileSdkVersion
- Ensure matches Expo SDK requirements

#### Runtime Crashes

**Red screen of death**
1. Read error message carefully
2. Check stack trace for your code vs library code
3. If library code, check GitHub issues
4. Add ErrorBoundary to isolate component

**Silent failures**
```typescript
// Add global error handler
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Global error:', error);
  // Log to service
});
```

#### Network Issues

**API calls failing**
```typescript
// Debug network requests
console.log('Request:', { url, headers, body });

// Check for CORS (shouldn't affect native)
// Verify SSL certificates
// Test with curl/Postman first
```

**Supabase connection issues**
- Verify SUPABASE_URL in env
- Check RLS policies
- Test with Supabase dashboard

### Step 4: Debug Tools

**React Native Debugger**
```bash
# Open DevTools
# Press 'j' in Metro terminal
```

**Flipper (advanced)**
- Network inspector
- Layout inspector
- Crash reporter

**Console debugging**
```typescript
// Structured logging
console.log('[Screen:Home]', { memberId, action: 'load' });

// Performance timing
console.time('fetchMembers');
await fetchMembers();
console.timeEnd('fetchMembers');
```

### Step 5: Platform-Specific Debugging

**iOS Simulator**
```bash
# View logs
xcrun simctl spawn booted log stream --level debug

# Reset simulator
xcrun simctl erase all
```

**Android Emulator**
```bash
# View logcat
adb logcat *:E

# Clear app data
adb shell pm clear com.sanctum.mobile
```

## Sanctum-Specific Debug Checklist

1. **Auth issues**: Check Supabase auth logs in dashboard
2. **QR not showing**: Verify member has valid `qr_token`
3. **Check-in fails**: Verify RLS allows insert to `check_ins`
4. **Org code invalid**: Check `organizations` table for `org_code`
5. **Profile not saving**: Check `members` update RLS policy

## Escalation Path

If debugging doesn't resolve:
1. Search Expo GitHub issues
2. Check React Native upgrade helper
3. Post to Expo Discord with reproduction
4. Create minimal reproduction repo
