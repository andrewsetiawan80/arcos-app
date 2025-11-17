# Building Android APK

## Prerequisites

1. **Expo Account**: You need a free Expo account
2. **EAS CLI**: Will be installed automatically when you run the build command

## Steps to Build APK

### Option 1: Using EAS Build (Recommended - Cloud Build)

1. **Install EAS CLI globally** (optional, or use npx):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   npx eas-cli login
   ```
   Or create an account if you don't have one:
   ```bash
   npx eas-cli register
   ```

3. **Configure EAS Project** (first time only):
   ```bash
   cd arqon-mobile
   npx eas-cli build:configure
   ```

4. **Build APK**:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```
   
   This will:
   - Build the APK in the cloud
   - Provide a download link when complete
   - Take about 10-15 minutes

### Option 2: Local Build (Requires Android Studio)

If you have Android Studio and Android SDK installed:

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli
   ```

2. **Build locally**:
   ```bash
   cd arqon-mobile
   npx expo build:android -t apk
   ```

   Note: This method is deprecated. EAS Build is recommended.

## Build Profiles

- **preview**: Builds APK for testing (internal distribution)
- **production**: Builds APK for production release

## After Build

Once the build completes, you'll receive a download link for the APK file. You can:
- Download and install on Android devices
- Share with testers
- Upload to Google Play Store (for production builds)

## Troubleshooting

- If you get "EAS project not configured", run `npx eas-cli build:configure` first
- Make sure you're logged in: `npx eas-cli login`
- Check that your `app.json` has the Android package name set

## Quick Start Command

```bash
cd arqon-mobile
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

