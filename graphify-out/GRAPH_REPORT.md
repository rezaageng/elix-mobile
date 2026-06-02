# Graph Report - .  (2026-06-02)

## Corpus Check
- 52 files · ~63,499 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 393 nodes · 567 edges · 37 communities (23 shown, 14 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.85)
- Token cost: 8,750 input · 600 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App UI Layer|App UI Layer]]
- [[_COMMUNITY_API Data Layer|API Data Layer]]
- [[_COMMUNITY_Dependencies|Dependencies]]
- [[_COMMUNITY_Project Skills|Project Skills]]
- [[_COMMUNITY_Guilds API|Guilds API]]
- [[_COMMUNITY_API Schemas|API Schemas]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_Dev Tools|Dev Tools]]
- [[_COMMUNITY_Quests API|Quests API]]
- [[_COMMUNITY_Screen Components|Screen Components]]
- [[_COMMUNITY_API Modules|API Modules]]
- [[_COMMUNITY_Opencode Config|Opencode Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_VSCode Settings|VSCode Settings]]
- [[_COMMUNITY_Metro Config|Metro Config]]
- [[_COMMUNITY_React Logos|React Logos]]
- [[_COMMUNITY_Design System|Design System]]
- [[_COMMUNITY_VSCode Extensions|VSCode Extensions]]
- [[_COMMUNITY_Android Icon Background|Android Icon Background]]
- [[_COMMUNITY_Android Icon Foreground|Android Icon Foreground]]
- [[_COMMUNITY_Android Icon Monochrome|Android Icon Monochrome]]
- [[_COMMUNITY_App Config|App Config]]
- [[_COMMUNITY_App Icon|App Icon]]
- [[_COMMUNITY_Auth Client|Auth Client]]
- [[_COMMUNITY_Favicon|Favicon]]
- [[_COMMUNITY_Login Background|Login Background]]
- [[_COMMUNITY_Project Metadata|Project Metadata]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Guild Screen|Guild Screen]]
- [[_COMMUNITY_Splash Icon|Splash Icon]]
- [[_COMMUNITY_Utility Functions|Utility Functions]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 40 edges
2. `expo` - 14 edges
3. `useThemeColor()` - 13 edges
4. `Button()` - 10 edges
5. `Button Component` - 8 edges
6. `scripts` - 7 edges
7. `skills` - 7 edges
8. `Roles Screen` - 6 edges
9. `Header Component` - 6 edges
10. `adaptiveIcon` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Button Component` --conceptually_related_to--> `Profile Tab Screen`  [INFERRED]
  components/button.tsx → app/(tabs)/profile.tsx
- `LoginScreen()` --calls--> `useThemeColor()`  [EXTRACTED]
  app/login/index.tsx → lib/use-theme-color.ts
- `Button Component` --conceptually_related_to--> `Quest Tab Screen`  [INFERRED]
  components/button.tsx → app/(tabs)/index.tsx
- `Header Component` --conceptually_related_to--> `Quest Tab Screen`  [INFERRED]
  components/header.tsx → app/(tabs)/index.tsx
- `Button Component` --conceptually_related_to--> `Login Screen`  [INFERRED]
  components/button.tsx → app/login/index.tsx

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Hyperedges (group relationships)
- **Quest Onboarding Pipeline** — screen_create_main_quest, screen_create_side_quest, screen_create_recurring_quests [INFERRED 0.90]
- **Auth Guard Navigation System** — root_navigator, screen_login, screen_roles, tab_layout [INFERRED 0.85]
- **API Data Fetching Layer** — api_guilds_GuildsModule, api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule, api_verification_VerificationModule [INFERRED 0.85]
- **User State Cache Invalidation Group** — api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule [INFERRED 0.80]
- **Android Adaptive Icon Set** — android_icon_foreground, android_icon_background, android_icon_monochrome [EXTRACTED 1.00]

## Communities (37 total, 14 thin omitted)

### Community 0 - "App UI Layer"
Cohesion: 0.07
Nodes (39): useChooseClass(), useClasses(), useCreateClass(), createQuests(), deleteQuest(), overrideQuest(), useClassQuests(), Class (+31 more)

### Community 1 - "API Data Layer"
Cohesion: 0.06
Nodes (34): chooseClass(), createClass(), deleteClass(), getClass(), getClasses(), updateClass(), ApiError, apiFetch() (+26 more)

### Community 2 - "Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, better-auth, @better-auth/expo, clsx, expo, expo-constants, expo-font, @expo-google-fonts/crimson-pro (+35 more)

### Community 3 - "Project Skills"
Cohesion: 0.06
Nodes (32): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+24 more)

### Community 4 - "Guilds API"
Cohesion: 0.07
Nodes (17): approveMember(), createGuild(), getGuild(), getGuildLeaderboard(), getGuildMessages(), joinGuild(), searchGuilds(), uploadMessageAttachment() (+9 more)

### Community 5 - "API Schemas"
Cohesion: 0.07
Nodes (25): ApiErrorData, ApiErrorEnvelope, ApproveMemberBodySchema, BaseStats, BaseStatsSchema, BuyItemBodySchema, ClassChoice, ClassChoiceSchema (+17 more)

### Community 6 - "App Configuration"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, reactCompiler (+18 more)

### Community 7 - "Dev Tools"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-expo, @eslint/eslintrc, eslint-plugin-unicorn, @ianvs/prettier-plugin-sort-imports, prettier, prettier-plugin-tailwindcss (+14 more)

### Community 8 - "Quests API"
Cohesion: 0.11
Nodes (12): getClassQuests(), startQuestProgress(), updateQuest(), updateQuestProgress(), LevelUpInfo, LevelUpInfoSchema, OverrideQuestBody, QuestProgress (+4 more)

### Community 9 - "Screen Components"
Cohesion: 0.28
Nodes (16): Classes API Module, API Fetch Client, Quests API Module, Auth Client, Button Component, Header Component, Root Navigator, Create Main Quest Screen (+8 more)

### Community 10 - "API Modules"
Cohesion: 0.57
Nodes (7): Guilds API Module, Quests API Module, Schema Definitions, Shop API Module, Users API Module, Verification API Module, Query Client

### Community 11 - "Opencode Config"
Cohesion: 0.29
Nodes (6): enabled, type, url, mcp, better-auth, $schema

### Community 12 - "TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 13 - "ESLint Config"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 14 - "VSCode Settings"
Cohesion: 0.40
Nodes (4): editor.codeActionsOnSave, source.fixAll, source.organizeImports, source.sortMembers

### Community 15 - "Metro Config"
Cohesion: 0.67
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

### Community 16 - "React Logos"
Cohesion: 0.67
Nodes (4): Partial React Logo, React Logo, React Logo (2x), React Logo (3x)

### Community 17 - "Design System"
Cohesion: 0.67
Nodes (3): Color Design Tokens, Tailwind Theme Configuration, useThemeColor Hook

## Knowledge Gaps
- **170 isolated node(s):** `recommendations`, `source.fixAll`, `source.organizeImports`, `source.sortMembers`, `name` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `API Data Layer` to `Quests API`, `App UI Layer`, `Guilds API`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Dependencies` to `Dev Tools`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Classes API Module` connect `Screen Components` to `API Schemas`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `recommendations`, `source.fixAll`, `source.organizeImports` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App UI Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06836158192090395 - nodes in this community are weakly interconnected._
- **Should `API Data Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.055904961565338925 - nodes in this community are weakly interconnected._
- **Should `Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._