# Graph Report - elix-mobile  (2026-06-05)

## Corpus Check
- 78 files · ~110,587 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 395 nodes · 556 edges · 38 communities (23 shown, 15 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `363cf3db`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 40 edges
2. `expo` - 14 edges
3. `useThemeColor()` - 13 edges
4. `Button()` - 11 edges
5. `scripts` - 7 edges
6. `skills` - 7 edges
7. `cn()` - 6 edges
8. `Roles Screen` - 6 edges
9. `CreateQuestBody` - 5 edges
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

## Communities (38 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (34): useChooseClass(), useClasses(), useCreateClass(), createQuests(), useClassQuests(), CreateQuestBody, useCurrentUser(), Button() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (34): chooseClass(), createClass(), deleteClass(), getClass(), getClasses(), updateClass(), ApiError, apiFetch() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (43): dependencies, better-auth, @better-auth/expo, clsx, expo, expo-constants, expo-font, @expo-google-fonts/crimson-pro (+35 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (20): approveMember(), createGuild(), getGuild(), getGuildLeaderboard(), getGuildMessages(), joinGuild(), searchGuilds(), uploadMessageAttachment() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (27): ApiErrorData, ApiErrorEnvelope, ApproveMemberBodySchema, BaseStats, BaseStatsSchema, BuyItemBodySchema, Class, ClassChoice (+19 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, reactCompiler (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-expo, @eslint/eslintrc, eslint-plugin-unicorn, @ianvs/prettier-plugin-sort-imports, prettier, prettier-plugin-tailwindcss (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (15): deleteQuest(), getClassQuests(), overrideQuest(), startQuestProgress(), updateQuest(), updateQuestProgress(), LevelUpInfo, LevelUpInfoSchema (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (13): Classes API Module, API Fetch Client, Quests API Module, Auth Client, Button Component, Header Component, Root Navigator, Create Role Screen (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.47
Nodes (6): Guilds API Module, Quests API Module, Shop API Module, Users API Module, Verification API Module, Query Client

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (6): enabled, type, url, mcp, better-auth, $schema

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 14 - "Community 14"
Cohesion: 0.40
Nodes (4): editor.codeActionsOnSave, source.fixAll, source.organizeImports, source.sortMembers

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (4): Partial React Logo, React Logo, React Logo (2x), React Logo (3x)

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (3): Color Design Tokens, Tailwind Theme Configuration, useThemeColor Hook

## Knowledge Gaps
- **176 isolated node(s):** `MainQuestEntry`, `QuestEntry`, `SideQuestEntry`, `ErrorSchema`, `ErrorEnvelopeSchema` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `Community 1` to `Community 8`, `Community 0`, `Community 4`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Classes API Module` connect `Community 9` to `Community 5`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 7`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `MainQuestEntry`, `QuestEntry`, `SideQuestEntry` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08200290275761973 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.055904961565338925 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._