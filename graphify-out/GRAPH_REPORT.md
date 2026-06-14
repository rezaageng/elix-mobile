# Graph Report - elix-mobile  (2026-06-15)

## Corpus Check
- 96 files · ~123,017 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1126 nodes · 1473 edges · 86 communities (72 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de166c1a`
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
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 48 edges
2. `useThemeColor()` - 25 edges
3. `Native Tabs` - 21 edges
4. `useHeaderOptions()` - 19 edges
5. `WebGPU & Three.js for Expo` - 17 edges
6. `App Store Metadata` - 16 edges
7. `useClassQuests()` - 15 edges
8. `expo` - 14 edges
9. `Submitting to iOS App Store` - 14 edges
10. `Submitting to Google Play Store` - 14 edges

## Surprising Connections (you probably didn't know these)
- `QuestScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/(tabs)/index.tsx → lib/api/quests.ts
- `QuestScreen()` --calls--> `useDeleteQuest()`  [INFERRED]
  app/(tabs)/index.tsx → lib/api/quests.ts
- `ProfileScreen()` --calls--> `useCurrentUser()`  [INFERRED]
  app/(tabs)/profile.tsx → lib/api/users.ts
- `LoginScreen()` --calls--> `useThemeColor()`  [EXTRACTED]
  app/login/index.tsx → lib/use-theme-color.ts
- `QuestDetailScreen()` --calls--> `useDeleteQuest()`  [INFERRED]
  app/quest/[id].tsx → lib/api/quests.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`

## Hyperedges (group relationships)
- **Quest Onboarding Pipeline** — screen_create_main_quest, screen_create_side_quest, screen_create_recurring_quests [INFERRED 0.90]
- **Auth Guard Navigation System** — root_navigator, screen_login, screen_roles, tab_layout [INFERRED 0.85]
- **API Data Fetching Layer** — api_guilds_GuildsModule, api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule, api_verification_VerificationModule [INFERRED 0.85]
- **User State Cache Invalidation Group** — api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule [INFERRED 0.80]
- **Android Adaptive Icon Set** — android_icon_foreground, android_icon_background, android_icon_monochrome [EXTRACTED 1.00]

## Communities (86 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (16): useChooseClass(), useClass(), useClasses(), useCreateClass(), useUpdateClass(), Header(), HeaderProps, useHeaderOptions() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (38): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors, Components (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (47): dependencies, better-auth, @better-auth/expo, clsx, expo, expo-constants, expo-font, @expo-google-fonts/crimson-pro (+39 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (20): approveMember(), createGuild(), getGuild(), getGuildLeaderboard(), getGuildMessages(), joinGuild(), searchGuilds(), uploadMessageAttachment() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (33): getClassQuests(), getClassQuestsForAuthoring(), startQuestProgress(), updateQuestProgress(), ApiErrorData, ApiErrorEnvelope, ApproveMemberBodySchema, BaseStatsSchema (+25 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, reactCompiler (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-expo, @eslint/eslintrc, eslint-plugin-unicorn, @ianvs/prettier-plugin-sort-imports, prettier, prettier-plugin-tailwindcss (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.43
Nodes (3): colors, ThemeColorKey, ThemeColors

### Community 9 - "Community 9"
Cohesion: 0.33
Nodes (7): Classes API Module, API Fetch Client, Button Component, Root Navigator, Login Screen, Roles Screen, Tab Layout

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

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (12): apiFetch(), PaginatedMeta, PublicUserSchema, deleteAvatar(), deleteBanner(), getCurrentUser(), getUser(), getUserStats() (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (38): agent, council, designer, explorer, fixer, librarian, observer, oracle (+30 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (13): deleteQuest(), overrideQuest(), startStarterQuests(), updateQuest(), NativeDateTimePicker(), NativeDateTimePickerProps, PickerMode, WEEKDAYS (+5 more)

### Community 38 - "Community 38"
Cohesion: 0.17
Nodes (11): chooseClass(), createClass(), deleteClass(), getClass(), getClasses(), updateClass(), ClassChoice, ClassChoiceSchema (+3 more)

### Community 39 - "Community 39"
Cohesion: 0.16
Nodes (19): QuestActionsSheet, QuestActionsSheetProps, QuestActionsSheetReference, formatHours(), getDurationInfo(), getEffectiveQuestValues(), getEffectiveStartedAt(), getQuestStatus() (+11 more)

### Community 40 - "Community 40"
Cohesion: 0.13
Nodes (10): BuyItemBody, InventoryItem, InventoryItemSchema, Item, ItemSchema, UseItemBody, buyItem(), consumeItem() (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.06
Nodes (35): Age Rating (Advisory), App Store Metadata, App Store Optimization (ASO), ASO Checklist, Async Configuration (External Localization), Basic Dynamic Config, Before Each Release, "Binary not found" (+27 more)

### Community 42 - "Community 42"
Cohesion: 0.06
Nodes (44): useDeleteClass(), Class, PublicUser, UserStats, useUploadAvatar(), useUploadBanner(), useUserStats(), getProfileSettings() (+36 more)

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (4): BaseStats, PeriodKey, periodLabels, StatsLineChartProps

### Community 44 - "Community 44"
Cohesion: 0.16
Nodes (17): useClassQuestsForAuthoring(), useCreateQuests(), useDeleteQuest(), useOverrideQuest(), useStartQuestProgress(), useUpdateQuest(), ClassQuest, descriptionSchema (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.21
Nodes (15): useClassQuests(), useUpdateQuestProgress(), LevelUpInfo, VerificationResult, useCurrentUser(), useSubmitVerification(), Button(), ButtonProps (+7 more)

### Community 46 - "Community 46"
Cohesion: 0.06
Nodes (35): App Review Process, App Store Connect API Key (Recommended), App Store Connect Configuration, App Store Metadata, App Store (Production), Apple ID Authentication (Alternative), Automatic Release, Build stuck in "Processing" (+27 more)

### Community 47 - "Community 47"
Cohesion: 0.06
Nodes (30): After (Native Tabs), Basic Usage, Before (JS Tabs), Behavior Options, Bottom Accessory (SDK 55+), Common Issues, Conditional Tabs, Custom Web Layout (+22 more)

### Community 48 - "Community 48"
Cohesion: 0.08
Nodes (25): 1. Create Service Account, 2. Link to Play Console, 3. Configure EAS, "APK not acceptable", "App not found", App Signing, Checking Signing Status, Common Issues (+17 more)

### Community 49 - "Community 49"
Cohesion: 0.08
Nodes (24): 1. make-webgpu-renderer.ts, 1. "X is not part of the THREE namespace", 2. fiber-canvas.tsx, 2. TypeScript Errors with Three.js, 3. Blank Screen, 4. Performance Issues, 5. Peer Dependency Errors, Animation with useFrame (+16 more)

### Community 50 - "Community 50"
Cohesion: 0.08
Nodes (23): Behavior, Code Style, Common route structure, Context Menus, Expo UI Guidelines, General Styling Rules, Library Preferences, Link (+15 more)

### Community 51 - "Community 51"
Cohesion: 0.09
Nodes (22): Animated Components (`src/tw/animated.tsx`), Apple System Colors with CSS Variables, Configuration Files, CSS Component Wrappers, Custom Theme Variables, Global CSS, Image Component (`src/tw/image.tsx`), IMPORTANT: No Babel Config Needed (+14 more)

### Community 52 - "Community 52"
Cohesion: 0.10
Nodes (20): Best Practices, Customization, Customization, Date/Time Picker, Discrete Steps, Display Styles, Keyboard Types, Min/Max Dates (+12 more)

### Community 53 - "Community 53"
Cohesion: 0.10
Nodes (19): Animated Symbols, Animation Effects, Basic Usage, Best Practices, Camera, Common Icons, Communication, Content Actions (+11 more)

### Community 54 - "Community 54"
Cohesion: 0.10
Nodes (19): AsyncFunction, Constant, Defining a Shared Object, Either Types (Union types), Enums (Enumerable), Events, Exposing via Class DSL, Function (Synchronous) (+11 more)

### Community 55 - "Community 55"
Cohesion: 0.11
Nodes (17): Android, Automated Deployments, Build Commands, Deployment, EAS Configuration, Initialize EAS, Install EAS CLI, iOS (+9 more)

### Community 56 - "Community 56"
Cohesion: 0.12
Nodes (15): 1. Basic Fetch Usage, 2. React Query (TanStack Query), 3. Error Handling, 4. Authentication, 5. Offline Support, 6. Environment Variables, 7. Request Cancellation, Common Issues & Solutions (+7 more)

### Community 57 - "Community 57"
Cohesion: 0.13
Nodes (14): Animations, Best Practices, Common Animation Presets, Customizing Animations, Entering and Exiting Animations, Entering Animations, Exiting Animations, Gesture Animations (+6 more)

### Community 58 - "Community 58"
Cohesion: 0.13
Nodes (14): Basic Loader, Best Practices, Configuration, Dynamic Routes, Error Boundaries, Expo Router Data Loaders, Imports, Loading States with Suspense (+6 more)

### Community 59 - "Community 59"
Cohesion: 0.13
Nodes (14): Backdrop Blur, Best Practices, Checking Availability, Fallback Pattern, Glass Buttons, Glass Card, Glass Effects (iOS 26+), Intensity (+6 more)

### Community 60 - "Community 60"
Cohesion: 0.14
Nodes (13): Array Routes for Multiple Stacks, Catch-All Routes, Complete App Structure Example, Dynamic Routes, File Conventions, Group Routes, Layout Files, Not Found Routes (+5 more)

### Community 61 - "Community 61"
Cohesion: 0.14
Nodes (13): Build on Push, Conditional Jobs, EAS Workflows, Job Dependencies, Job Types, Native PR Previews with EAS Updates, PR Previews, Production Release (+5 more)

### Community 62 - "Community 62"
Cohesion: 0.15
Nodes (12): Basic Usage, Common Detent Values, Complete Example, Content not filling sheet, Form Sheet Screen Content, Form Sheet with Footer, Form Sheets in Expo Router, Formsheet with interactive content below (+4 more)

### Community 63 - "Community 63"
Cohesion: 0.15
Nodes (12): Debounced Search, Empty States, Filtering Patterns, Header Search Bar, Multiple Fields, Options, Search, Search Suggestions (+4 more)

### Community 64 - "Community 64"
Cohesion: 0.15
Nodes (12): Button, Components, Limitations, Mail inbox example, Menu, Notes app example, Placement, Recommendations (+4 more)

### Community 65 - "Community 65"
Cohesion: 0.17
Nodes (11): Apple Zoom Transitions, Basic Zoom, Best Practices, Combining with Link.Preview, Controlling Dismissal, Custom Alignment Rectangle, Destination Target, Disable all dismissal gestures (+3 more)

### Community 66 - "Community 66"
Cohesion: 0.18
Nodes (10): Create a Local Module (in existing app), Create a Standalone Module (for publishing), expo-module.config.json, Module Structure Reference, Quick Start, References, What to remove for a module-only (no native view):, What to remove for a view-only (no module functions): (+2 more)

### Community 67 - "Community 67"
Cohesion: 0.32
Nodes (4): ApiError, FetchOptions, VerificationResultSchema, submitVerification()

### Community 68 - "Community 68"
Cohesion: 0.11
Nodes (15): createQuests(), CreateQuestBody, Quest, descriptionSchema, durationSchema, entriesSchema, entrySchema, nameSchema (+7 more)

### Community 69 - "Community 69"
Cohesion: 0.20
Nodes (9): Building for Specific Platform, Building for TestFlight, Building Locally, Checking Build Status, EAS Configuration, Important: When Development Clients Are Needed, Installing Local Builds, Troubleshooting (+1 more)

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): Button Gradient, Common Patterns, CSS Gradients, Frosted Glass Effect, Important Notes, Linear Gradients, Multiple Gradients, Overlay on Image (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.27
Nodes (4): authClient, { useSession }, queryClient, LoginScreen()

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (8): Android Activity Lifecycle (in module definition), Android Lifecycle Listeners, ApplicationLifecycleListener, iOS App Lifecycle (in module definition), iOS AppDelegate Subscribers, Lifecycle Hooks Reference, Module Lifecycle (in module definition), ReactActivityLifecycleListener

### Community 73 - "Community 73"
Cohesion: 0.25
Nodes (7): Architecture, Developer commands, Environment, graphify, Project, Style & conventions, Tooling quirks

### Community 75 - "Community 75"
Cohesion: 0.25
Nodes (7): Audio Playback, Audio Recording (Microphone), Camera, Media, Saving Base64 Images, Saving Media, Video Playback

### Community 76 - "Community 76"
Cohesion: 0.25
Nodes (7): AsyncFunction on Views, Defining a View, GroupView (Android), Native View Reference, PropGroup (Android), View Event Dispatching, View Lifecycle

### Community 77 - "Community 77"
Cohesion: 0.25
Nodes (7): Skip the Prompts, Submit, Tester Strategy, TestFlight, Tips, Troubleshooting, Why TestFlight First

### Community 79 - "Community 79"
Cohesion: 0.29
Nodes (7): scripts, android, ios, lint, reset-project, start, web

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (6): Config Plugins Reference, Key Rules, Plugin Structure, Reading Config Values in Native Code, Using in app.json, Writing a Plugin

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (6): Full SQLite for Complex Data, Key-Value Storage, React Hook for Storage, Storage, Storage with React State, When to Use What

### Community 82 - "Community 82"
Cohesion: 0.33
Nodes (5): Get a fresh project, Get started, Join the community, Learn more, Welcome to your Expo app 👋

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (5): Autolinking, expo-module.config.json, Fields, Module Configuration Reference, Resolution Order

### Community 85 - "Community 85"
Cohesion: 0.40
Nodes (4): main, name, private, version

## Knowledge Gaps
- **672 isolated node(s):** `$schema`, `plugin`, `@opencode-ai/plugin`, `recommendations`, `source.fixAll` (+667 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `Community 26` to `Community 67`, `Community 4`, `Community 5`, `Community 38`, `Community 68`, `Community 37`, `Community 40`, `Community 42`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 85`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `Classes API Module` connect `Community 9` to `Community 5`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `@opencode-ai/plugin` to the rest of the system?**
  _672 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._