# Elix Mobile

Mobile app for **Elix** — a gamified social platform built with React Native / Expo. Users pick a role, complete quests, earn rewards, and participate in guild chat and leaderboards.

## Stack

- **Framework:** [Expo](https://expo.dev) with `expo-router` file-based routing
- **UI:** React Native, NativeWind (Tailwind CSS for RN), `@gorhom/bottom-sheet`
- **State & Data:** TanStack Query, Zustand-like settings store, Zod v4 schemas
- **Auth:** Better Auth with `@better-auth/expo`, `expo-secure-store`, Google & Twitter OAuth
- **Networking:** Custom fetch wrapper with cookie auth, Zod-validated API calls
- **Real-time:** Socket.IO client for guild chat
- **Push:** `expo-notifications` with scheduled local reminders
- **Tests:** Jest + React Native Testing Library, Maestro for E2E on Android

## Prerequisites

- Node.js LTS
- pnpm 11.8.0 (enforced via `packageManager`)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) and a local Metro-compatible environment
- A running Elix backend (`../elix-server`) with API URL
- OAuth credentials (Google / Twitter) configured in the backend

## Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Create `.env` at the project root:

   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

3. Start the development server

   ```bash
   pnpm start
   ```

   Then press `a` for Android, `i` for iOS, or `w` for web.

## Development

| Command                        | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `pnpm start`                   | Start the Expo dev server                   |
| `pnpm run android`             | Run on Android (dev build)                  |
| `pnpm run ios`                 | Run on iOS (dev build)                      |
| `pnpm run web`                 | Run web build                               |
| `pnpm run lint`                | Run ESLint                                  |
| `pnpm test`                    | Run Jest unit tests                         |
| `pnpm test:ci`                 | Run tests with coverage                     |
| `pnpm test:e2e`                | Run Maestro E2E critical flows              |
| `pnpm test:e2e:full`           | Run all Maestro E2E flows                   |
| `pnpm run build:android:local` | Build a local debug APK                     |
| `pnpm run reset-project`       | Reset `app/` to a blank Expo Router starter |

## Architecture

- **Entry:** `expo-router/entry` (set in `package.json`)
- **Routes:** `app/` directory with file-based routing
  - `app/(tabs)/` — main tab screens: home, guild, inventory, shop, profile
  - `app/login/` — authentication screen
  - `app/roles/` — role selection and creation
  - `app/quest/` — quest detail, management, verification
  - `app/guild/` — guild chat, members, leaderboard
  - `app/user/[id]` — public user profile
- **API layer:** `lib/api/`
  - `client.ts` — fetch wrapper with cookie auth, Zod validation, and `ApiError`
  - `schemas.ts` — Zod v4 request/response schemas
  - `guilds.ts`, `quests.ts`, `users.ts`, `classes.ts`, `shop.ts`, `verification.ts`, `notifications.ts` — domain clients
- **Auth:** `lib/auth-client.ts` with Better Auth session hook and cookie-backed storage
- **Notifications:** `lib/notifications/` for push registration, scheduling, and tap handling
- **Query:** `lib/query-client.ts` with 5-minute stale time and 2 retries

## Conventions

- All imports use the `@/*` alias. ESLint forbids relative imports (`../`, `./`).
- Use NativeWind/Tailwind classes for styling; classes are sorted by Prettier.
- Import order is enforced by `@ianvs/prettier-plugin-sort-imports`.
- Prettier: no semicolons, double quotes, 2-space indent, trailing commas.
- The `newArchEnabled`, `typedRoutes`, and `reactCompiler` experiments are enabled in `app.json`.

## E2E Testing

Maestro runs against a development build. The debug APK needs the Metro bundler running.

```bash
# Terminal 1: start Metro
export EXPO_PUBLIC_API_URL=http://localhost:3000
pnpm start

# Terminal 2: build, install, and run critical tests
pnpm run build:android:local
adb install android/app/build/outputs/apk/debug/app-debug.apk
pnpm run test:e2e
```

See [`e2e/README.md`](./e2e/README.md) for detailed setup and CI workflow.

## Backend

This app is paired with the backend project at [here](https://github.com/rezaageng/elix-server/). The OpenAPI spec at `https://localhost:3001/referece` is the source of truth for API shape and is used for client generation reference.
