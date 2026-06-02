## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Project

Expo React Native app ("Elix") using file-based routing via `expo-router`, NativeWind (Tailwind for RN), and Better Auth.

## Developer commands

- `pnpm start` — Expo dev server
- `pnpm run android` / `pnpm run ios` / `pnpm run web` — Platform-specific start
- `pnpm run lint` — ESLint (only verification command; no test runner configured)
- `pnpm run reset-project` — Moves starter code to `app-example/` and creates blank `app/`

## Environment

- `EXPO_PUBLIC_API_URL` is required at runtime (validated in `lib/api/client.ts`)
- App scheme: `elix://` (used for OAuth callbacks)

## Architecture

- Entry: `expo-router/entry` (package.json `main`)
- Routes in `app/`; layout auth guard in `app/_layout.tsx` redirects unauthenticated users to `/login`, users without an active class to `/roles`
- Tabs use `expo-router/unstable-native-tabs` (experimental API; check Expo docs before changing)
- API layer: `lib/api/` — `client.ts` wraps `fetch` with Zod validation, cookie auth via `authClient.getCookie()`, and custom `ApiError`
- Auth: `@better-auth/expo` with `expo-secure-store` for cookie persistence; social providers Google and Twitter
- Query: TanStack Query with 5-minute stale time, 2 retries (`lib/query-client.ts`)
- Schemas: `lib/api/schemas.ts` uses Zod v4 (`z.uuid()`, `z.iso.datetime()`)
- Backend Project: `../elix-server`
- OpenAPI spec: `../elix-server/openapi.yaml` (used for API client generation and reference)

## Style & conventions

- Import alias `@/*` maps to `./*`
- **ESLint forbids relative imports** (`../*`, `./*`) — always use `@/lib/...`, `@/components/...`, etc.
- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (`es5`)
- Import order enforced by `@ianvs/prettier-plugin-sort-imports`: React → Next (if any) → third-party → `@/lib/` → `@/hooks/` → `@/components/ui/` → `@/components/` → `@/app/` → relative
- VS Code auto-fixes, organizes imports, and sorts members on save
- Tailwind classes are sorted by `prettier-plugin-tailwindcss`
- Refer to `.agents/DESIGN.MD` for design system and component conventions

## Tooling quirks

- `metro.config.js` enables `unstable_enablePackageExports` and wires NativeWind with `app/global.css` as input
- `babel.config.js` uses `babel-preset-expo` with `jsxImportSource: 'nativewind'`
- `app.json` enables `newArchEnabled`, `typedRoutes`, and `reactCompiler` experiments
- No test runner (Jest/Vitest) is configured — do not add test commands without setting one up first
- `nativewind-env.d.ts` and `expo-env.d.ts` are included in tsconfig
