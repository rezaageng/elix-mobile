# Graph Report - elix-mobile  (2026-06-07)

## Corpus Check
- 90 files · ~116,441 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 501 nodes · 734 edges · 44 communities (30 shown, 14 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76d4fc02`
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 41 edges
2. `useThemeColor()` - 15 edges
3. `expo` - 14 edges
4. `Button()` - 13 edges
5. `agent` - 9 edges
6. `useClassQuests()` - 9 edges
7. `cn()` - 8 edges
8. `ClassQuest` - 7 edges
9. `scripts` - 7 edges
10. `ManageQuestScreen()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `QuestScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/(tabs)/index.tsx → lib/api/quests.ts
- `QuestDetailScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/quest/[id].tsx → lib/api/quests.ts
- `ManageQuestScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/quest/manage.tsx → lib/api/quests.ts
- `ManageQuestScreen()` --calls--> `useCreateQuests()`  [INFERRED]
  app/quest/manage.tsx → lib/api/quests.ts
- `ManageQuestScreen()` --calls--> `useOverrideQuest()`  [INFERRED]
  app/quest/manage.tsx → lib/api/quests.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Hyperedges (group relationships)
- **Quest Onboarding Pipeline** — screen_create_main_quest, screen_create_side_quest, screen_create_recurring_quests [INFERRED 0.90]
- **Auth Guard Navigation System** — root_navigator, screen_login, screen_roles, tab_layout [INFERRED 0.85]
- **API Data Fetching Layer** — api_guilds_GuildsModule, api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule, api_verification_VerificationModule [INFERRED 0.85]
- **User State Cache Invalidation Group** — api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule [INFERRED 0.80]
- **Android Adaptive Icon Set** — android_icon_foreground, android_icon_background, android_icon_monochrome [EXTRACTED 1.00]

## Communities (44 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (34): useChooseClass(), useClasses(), useCreateClass(), ApiError, FetchOptions, createQuests(), useClassQuests(), CreateQuestBody (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (10): PaginatedMeta, PaginatedMetaSchema, PublicUserSchema, UserStatsSchema, deleteAvatar(), getCurrentUser(), getUser(), getUserStats() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (47): dependencies, better-auth, @better-auth/expo, clsx, expo, expo-camera, expo-constants, expo-font (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (12): ApproveMemberBody, CreateGuildBody, Guild, GuildLeaderboardEntry, GuildLeaderboardEntrySchema, GuildMember, GuildMemberRecord, GuildMemberRecordSchema (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (21): ApiErrorData, ApiErrorEnvelope, ApproveMemberBodySchema, BaseStatsSchema, BuyItemBodySchema, CreateClassBodySchema, CreateGuildBodySchema, CreateQuestBodySchema (+13 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, reactCompiler (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (22): devDependencies, eslint, eslint-config-expo, @eslint/eslintrc, eslint-plugin-unicorn, @ianvs/prettier-plugin-sort-imports, prettier, prettier-plugin-tailwindcss (+14 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (13): deleteQuest(), overrideQuest(), startQuestProgress(), updateQuestProgress(), ClassQuestSchema, LevelUpInfoSchema, OverrideQuestBody, Quest (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (9): Classes API Module, API Fetch Client, Auth Client, Button Component, Root Navigator, Create Role Screen, Login Screen, Roles Screen (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (4): Guilds API Module, Shop API Module, Verification API Module, Query Client

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

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (37): agent, council, designer, explorer, fixer, librarian, observer, oracle (+29 more)

### Community 37 - "Community 37"
Cohesion: 0.32
Nodes (5): useUpdateQuestProgress(), LevelUpInfo, clearPendingCameraImageUri(), getPendingCameraImageUri(), VerifySubmissionScreen()

### Community 38 - "Community 38"
Cohesion: 0.10
Nodes (22): chooseClass(), createClass(), deleteClass(), getClass(), getClasses(), updateClass(), apiFetch(), approveMember() (+14 more)

### Community 39 - "Community 39"
Cohesion: 0.10
Nodes (26): useCreateQuests(), useDeleteQuest(), useOverrideQuest(), useStartQuestProgress(), ClassQuest, QuestActionsSheet, QuestActionsSheetProps, QuestActionsSheetReference (+18 more)

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (10): BuyItemBody, InventoryItem, InventoryItemSchema, Item, ItemSchema, UseItemBody, buyItem(), consumeItem() (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.09
Nodes (21): Class, PublicUser, UserStats, useCurrentUser(), useUserStats(), ProfileSettings, SettingsSchema, useProfileSettings() (+13 more)

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (4): BaseStats, PeriodKey, periodLabels, StatsLineChartProps

## Knowledge Gaps
- **215 isolated node(s):** `TabKey`, `PeriodKey`, `periodLabels`, `PeriodFilter`, `filters` (+210 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `Community 38` to `Community 0`, `Community 1`, `Community 4`, `Community 5`, `Community 8`, `Community 40`, `Community 42`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Classes API Module` connect `Community 9` to `Community 5`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 7`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `TabKey`, `PeriodKey`, `periodLabels` to the rest of the system?**
  _215 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08705882352941176 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._