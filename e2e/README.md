# E2E Tests (Maestro)

This directory contains Maestro end-to-end tests for the Elix React Native app.

## Prerequisites

- [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro) installed
- Android emulator running (or physical device connected)
- Debug APK built

## Installing Maestro CLI

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

## Setup

This project uses a development build (`expo-dev-client`). The debug APK loads its JS bundle from a Metro bundler running on your machine. Both Metro and an emulator/device must be available when you run the tests.

### 1. Ensure `EXPO_PUBLIC_API_URL` is set

```bash
# In the terminal where Metro will run
export EXPO_PUBLIC_API_URL=http://localhost:3000
```

Or add it to your `.env` file:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 2. Start an emulator (or connect a device)

Via Android Studio AVD Manager, or from command line:

```bash
avdmanager create avd -n maestro -k "system-images;android-34;google_apis;x86_64" --device "pixel_6"
emulator -avd maestro -no-window -noaudio -gpu swiftshader_indirect
```

### 3. Build the Android debug APK

**Terminal 1 — build the APK:**

```bash
pnpm run build:android:local
```

This runs `expo prebuild --clean` then `./gradlew assembleDebug`.
The APK is output at `android/app/build/outputs/apk/debug/app-debug.apk`.

### 4. Start Metro and run tests

**Terminal 1 — start the Metro bundler:**

```bash
pnpm start
```

Wait until you see "Metro ready" / the QR code.

**Terminal 2 — install the APK and run E2E tests:**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
pnpm run test:e2e
```

Or directly:

```bash
maestro test e2e/
```

## Tests

| Test file | Description |
|-----------|-------------|
| `smoke-test.yaml` | Launches app, verifies login screen renders |

## Notes

- Tests use `com.elix.mobile` as the app package ID (set in `app.json` under `android.package`).
- Passing `clearState: true` in `launchApp` ensures a fresh start (clears auth tokens, etc.).
- No backend is required for the smoke test; it only asserts the login UI renders.
