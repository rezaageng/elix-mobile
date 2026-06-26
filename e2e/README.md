# E2E Tests (Maestro)

This directory contains Maestro end-to-end tests for the Elix React Native app.

## Prerequisites

- [Maestro CLI](https://maestro.mobile.dev/getting-started/installing-maestro) installed
- Android emulator running (or physical device connected)
- Debug APK built
- Test backend running with the required dev-login and seed endpoints (see below)

## Installing Maestro CLI

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

## Setup

This project uses a development build (`expo-dev-client`) for local development, or an E2E build profile for CI. The debug APK loads its JS bundle from a Metro bundler running on your machine. Both Metro and an emulator/device must be available when you run the tests locally.

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

Run a specific tier:

```bash
maestro test e2e/quests/
maestro test e2e/shop/
maestro test e2e/guild/
```

## Backend Prerequisites

Authenticated tests require a test backend running in development mode with email/password authentication enabled.

- `POST /api/auth/sign-in/email` — Better Auth's built-in email/password sign-in. Used by `shared/auth.yaml` to establish a real session.
- `POST /api/test/seed` — accepts `{ key: string, params?: object }` and idempotently creates/resets the test data described below.

The login screen shows an email/password form (enabled by `__DEV__` or `EXPO_PUBLIC_E2E_ENABLED=true`) with testIDs `DevEmailInput`, `DevPasswordInput`, and `DevSignInButton`. Maestro fills these in via `shared/auth.yaml`.

### EAS build profiles

| Profile | Use | Dev form visible? |
|---|---|---|
| `development` | Local dev with Expo dev client | Yes (`__DEV__`) |
| `preview` | User preview / internal QA | No |
| `e2e` | Maestro E2E test builds | Yes (`EXPO_PUBLIC_E2E_ENABLED=true`) |

Build the E2E APK with:

```bash
eas build --platform android --profile e2e
```

### Test users

`shared/auth.yaml` maps `USER_ID` to a test email and signs in with the default password `password123`:

| `USER_ID` | Email |
|---|---|
| `e2e-user-no-class` | `e2e-no-class@elix.app` |
| `e2e-user-with-class` | `e2e-with-class@elix.app` |
| `e2e-user-low-gold` | `e2e-low-gold@elix.app` |
| `e2e-user-no-guild` | `e2e-no-guild@elix.app` |
| `e2e-guild-member` | `e2e-guild-member@elix.app` |
| `e2e-guild-owner` | `e2e-guild-owner@elix.app` |

You can also pass `EMAIL` and `PASSWORD` directly to `auth.yaml`.

### Required seed keys

| Key | Data |
|---|---|
| `onboarding-templates` | 3+ class templates |
| `user-no-class` | User with session, no active class |
| `user-with-class` | User with session, active class, quests (3 types), gold (1000), 2 inventory items |
| `user-low-gold` | User with session, active class, gold (10) |
| `user-no-guild` | User with session, class, no guild |
| `user-guild-member` | User in a guild as regular member |
| `user-guild-owner` | User who owns a guild |
| `guild-full` | Guild with owner, 3 members, 2 officers, 5 chat messages |
| `quests-full` | Quests of each type (main, side, daily, weekly, event) for the user |
| `shop-items` | 4+ items: 2 consumable (incl. restore streak, deadline extension), 2 boosts |

## Shared Helpers

Common flows live in `e2e/shared/` and are invoked via Maestro's `runFlow`:

| File | Purpose |
|---|---|
| `shared/auth.yaml` | Dev-login + launch authenticated app |
| `shared/navigate.yaml` | Tap a native tab by visible label |
| `shared/seed.yaml` | Call backend seed endpoint |
| `shared/form.yaml` | Fill a field by testID |
| `shared/alert.yaml` | Tap an alert button by text |

## Tests

### Tier 1 — Smoke (P0)

| Test file | Description |
|-----------|-------------|
| `smoke-test.yaml` | Launches app, verifies login screen renders |
| `login-screen.yaml` | Verifies all login entry points are visible |
| `app-restart.yaml` | Verifies the login screen persists across a warm restart |

### Tier 2 — Auth & Onboarding (P0)

| Test file | Description |
|-----------|-------------|
| `auth/guard-no-session.yaml` | No session → routes redirect to `/login` |
| `auth/guard-no-class.yaml` | Session without class → lands on `/roles` |
| `auth/guard-has-class.yaml` | Session with class → lands on `/(tabs)` |
| `auth/logout-redirect.yaml` | Logout clears session and redirects to `/login` |
| `onboarding/choose-class.yaml` | Select a pre-made class template |
| `onboarding/create-class.yaml` | Create custom role + main/side/recurring quests |

### Tier 3 — Quests (P1)

| Test file | Description |
|-----------|-------------|
| `quests/list.yaml` | Quest list renders with filter tabs |
| `quests/filter.yaml` | Filter by quest type |
| `quests/detail.yaml` | Tap quest card → detail screen |
| `quests/create-daily.yaml` | Create a daily quest |
| `quests/text-submit-approved.yaml` | Text verification → approved |
| `quests/text-submit-rejected.yaml` | Text verification → rejected |
| `quests/delete.yaml` | Long-press quest → delete |

### Tier 4 — Shop & Inventory (P1)

| Test file | Description |
|-----------|-------------|
| `shop/load.yaml` | Shop items render |
| `shop/category-filter.yaml` | Filter by category |
| `shop/buy-sufficient.yaml` | Buy item with sufficient gold |
| `shop/buy-insufficient.yaml` | Insufficient gold blocks purchase |
| `inventory/empty.yaml` | Empty inventory state |
| `inventory/with-items.yaml` | Inventory renders with items |
| `inventory/use-restore-streak.yaml` | Use restore streak item |
| `inventory/use-deadline-extension.yaml` | Use deadline extension item |

### Tier 5 — Guild (P1)

| Test file | Description |
|-----------|-------------|
| `guild/discovery.yaml` | No guild → discovery screen |
| `guild/search.yaml` | Search guilds |
| `guild/create.yaml` | Create guild |
| `guild/home-member.yaml` | Guild home for regular member |
| `guild/home-owner.yaml` | Guild home for owner |
| `guild/members.yaml` | Members list |
| `guild/promote-demote.yaml` | Promote/demote member |
| `guild/leaderboard.yaml` | Leaderboard renders |
| `guild/leave.yaml` | Member leaves guild |
| `guild/chat-send.yaml` | Send chat message |

### Tier 6 — Profile (P2)

| Test file | Description |
|-----------|-------------|
| `profile/view.yaml` | Own profile renders |
| `profile/edit.yaml` | Edit profile name |
| `profile/settings.yaml` | Settings sheet + logout |
| `profile/user-profile.yaml` | View another user's profile |

### Tier 7 — Regression (P2)

| Test file | Description |
|-----------|-------------|
| `regression/tab-navigation.yaml` | Switch all 5 tabs |
| `regression/pull-to-refresh.yaml` | Pull-to-refresh on quest screen |

## Notes

- Tests use `com.elix.mobile` as the app package ID (set in `app.json` under `android.package`).
- Passing `clearState: true` in `launchApp` ensures a fresh start (clears auth tokens, etc.).
- No backend is required for the Tier 1 smoke tests; they only assert the login UI renders.
- OAuth popups, image pickers, push notifications, and WebSocket real-time behavior are not covered by these tests.
