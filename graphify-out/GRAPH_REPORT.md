# Graph Report - elix-mobile  (2026-06-22)

## Corpus Check
- 154 files · ~156,710 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1495 nodes · 2229 edges · 108 communities (95 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ecdaf0c3`
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
- [[_COMMUNITY_Community 18|Community 18]]
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
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 110|Community 110]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 61 edges
2. `useThemeColor()` - 45 edges
3. `useHeaderOptions()` - 25 edges
4. `Button()` - 21 edges
5. `Native Tabs` - 21 edges
6. `WebGPU & Three.js for Expo` - 17 edges
7. `useClassQuests()` - 16 edges
8. `useCurrentUser()` - 16 edges
9. `cn()` - 16 edges
10. `tasteskill: Anti-Slop Frontend Skill` - 16 edges

## Surprising Connections (you probably didn't know these)
- `QuestScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/(tabs)/index.tsx → lib/api/quests.ts
- `QuestScreen()` --calls--> `useDeleteQuest()`  [INFERRED]
  app/(tabs)/index.tsx → lib/api/quests.ts
- `QuestDetailScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/quest/[id].tsx → lib/api/quests.ts
- `QuestDetailScreen()` --calls--> `useDeleteQuest()`  [INFERRED]
  app/quest/[id].tsx → lib/api/quests.ts
- `ManageQuestScreen()` --calls--> `useClassQuests()`  [INFERRED]
  app/quest/manage.tsx → lib/api/quests.ts

## Import Cycles
- 1-file cycle: `metro.config.js -> metro.config.js`
- 2-file cycle: `components/profile/index.ts -> components/profile/profile-screen.tsx -> components/profile/index.ts`

## Hyperedges (group relationships)
- **Quest Onboarding Pipeline** — screen_create_main_quest, screen_create_side_quest, screen_create_recurring_quests [INFERRED 0.90]
- **Auth Guard Navigation System** — root_navigator, screen_login, screen_roles, tab_layout [INFERRED 0.85]
- **API Data Fetching Layer** — api_guilds_GuildsModule, api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule, api_verification_VerificationModule [INFERRED 0.85]
- **User State Cache Invalidation Group** — api_quests_QuestsModule, api_shop_ShopModule, api_users_UsersModule [INFERRED 0.80]
- **Android Adaptive Icon Set** — android_icon_foreground, android_icon_background, android_icon_monochrome [EXTRACTED 1.00]

## Communities (108 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.16
Nodes (11): createQuests(), Quest, GuildLeaderboardScreen(), useHeaderOptions(), CreateMainQuestScreen(), descriptionSchema, durationSchema, entriesSchema (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (38): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors, Components (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.04
Nodes (55): dependencies, better-auth, @better-auth/expo, clsx, expo, expo-clipboard, expo-constants, expo-dev-client (+47 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (37): computedHash, skillPath, source, sourceType, computedHash, skillPath, source, sourceType (+29 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (34): apiFetch(), approveMember(), createGuild(), deleteGuild(), getGuild(), getGuildLeaderboard(), getGuildMessages(), getGuildWebSocketUrl() (+26 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (38): ActiveBuffSchema, ApiErrorData, ApiErrorEnvelope, ApproveMemberBodySchema, BaseStatsSchema, BuyItemBody, BuyItemBodySchema, ClassSchema (+30 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (34): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, package, predictiveBackGestureEnabled (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): build, development, production, cli, appVersionSource, version, autoIncrement, developmentClient (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (21): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.50
Nodes (4): Classes API Module, Button Component, Login Screen, Roles Screen

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (3): Shop API Module, Verification API Module, Query Client

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

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (45): useChooseClass(), useClasses(), useDeleteClass(), Class, PublicUser, UserActivityItem, UserStats, getUser() (+37 more)

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (8): useClass(), useCreateClass(), useUpdateClass(), getZodErrorMessage(), CreateRoleScreen(), descriptionSchema, nameSchema, roleSchema

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (12): PaginatedMeta, PaginatedMetaSchema, UserActivityItemSchema, UserStatsSchema, deleteAvatar(), deleteBanner(), getCurrentUser(), getUserActivity() (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.05
Nodes (38): agent, council, designer, explorer, fixer, librarian, observer, oracle (+30 more)

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (3): mockGetCookie, TestSchema, validData

### Community 38 - "Community 38"
Cohesion: 0.27
Nodes (7): useGuilds(), useJoinGuild(), useMyGuilds(), DiscoveryScreen(), DiscoveryScreenProps, GuildDetailSheet, GuildScreen()

### Community 39 - "Community 39"
Cohesion: 0.09
Nodes (35): ActiveBuff, ClassQuest, QuestActionsSheet, QuestActionsSheetProps, QuestActionsSheetReference, formatHours(), getDurationInfo(), getEffectiveQuestValues() (+27 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 41 - "Community 41"
Cohesion: 0.06
Nodes (35): Age Rating (Advisory), App Store Metadata, App Store Optimization (ASO), ASO Checklist, Async Configuration (External Localization), Basic Dynamic Config, Before Each Release, "Binary not found" (+27 more)

### Community 42 - "Community 42"
Cohesion: 0.31
Nodes (8): useClassQuests(), useInventory(), useUseItem(), CreateSideQuestScreen(), getItemIcon(), getItemTypeLabel(), InventoryCard(), InventoryScreen()

### Community 43 - "Community 43"
Cohesion: 0.40
Nodes (4): BaseStats, PeriodKey, periodLabels, StatsLineChartProps

### Community 44 - "Community 44"
Cohesion: 0.17
Nodes (14): useCreateQuests(), useOverrideQuest(), useStartQuestProgress(), useUpdateQuest(), useCurrentUser(), NativeDateTimePicker(), NativeDateTimePickerProps, PickerMode (+6 more)

### Community 45 - "Community 45"
Cohesion: 0.16
Nodes (15): canLeaveGuild(), canManageGuild(), createDebounce(), getCurrentUserRoleInGuild(), getImageUploadInfo(), getInitialRoute(), getItemUseAction(), getMemberActions() (+7 more)

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
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

### Community 69 - "Community 69"
Cohesion: 0.20
Nodes (9): Building for Specific Platform, Building for TestFlight, Building Locally, Checking Build Status, EAS Configuration, Important: When Development Clients Are Needed, Installing Local Builds, Troubleshooting (+1 more)

### Community 70 - "Community 70"
Cohesion: 0.20
Nodes (9): Button Gradient, Common Patterns, CSS Gradients, Frosted Glass Effect, Important Notes, Linear Gradients, Multiple Gradients, Overlay on Image (+1 more)

### Community 71 - "Community 71"
Cohesion: 0.09
Nodes (19): deleteQuest(), getClassQuestsForAuthoring(), overrideQuest(), startQuestProgress(), startStarterQuests(), updateQuest(), ClassQuestSchema, LevelUpInfoSchema (+11 more)

### Community 72 - "Community 72"
Cohesion: 0.22
Nodes (8): Android Activity Lifecycle (in module definition), Android Lifecycle Listeners, ApplicationLifecycleListener, iOS App Lifecycle (in module definition), iOS AppDelegate Subscribers, Lifecycle Hooks Reference, Module Lifecycle (in module definition), ReactActivityLifecycleListener

### Community 73 - "Community 73"
Cohesion: 0.25
Nodes (7): Architecture, Developer commands, Environment, graphify, Project, Style & conventions, Tooling quirks

### Community 74 - "Community 74"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 75 - "Community 75"
Cohesion: 0.25
Nodes (7): Audio Playback, Audio Recording (Microphone), Camera, Media, Saving Base64 Images, Saving Media, Video Playback

### Community 76 - "Community 76"
Cohesion: 0.25
Nodes (7): AsyncFunction on Views, Defining a View, GroupView (Android), Native View Reference, PropGroup (Android), View Event Dispatching, View Lifecycle

### Community 77 - "Community 77"
Cohesion: 0.25
Nodes (7): Skip the Prompts, Submit, Tester Strategy, TestFlight, Tips, Troubleshooting, Why TestFlight First

### Community 78 - "Community 78"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

### Community 79 - "Community 79"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 80 - "Community 80"
Cohesion: 0.29
Nodes (6): Config Plugins Reference, Key Rules, Plugin Structure, Reading Config Values in Native Code, Using in app.json, Writing a Plugin

### Community 81 - "Community 81"
Cohesion: 0.29
Nodes (6): Full SQLite for Complex Data, Key-Value Storage, React Hook for Storage, Storage, Storage with React State, When to Use What

### Community 82 - "Community 82"
Cohesion: 0.29
Nodes (6): E2E Tests, Get a fresh project, Get started, Join the community, Learn more, Welcome to your Expo app 👋

### Community 83 - "Community 83"
Cohesion: 0.33
Nodes (5): Autolinking, expo-module.config.json, Fields, Module Configuration Reference, Resolution Order

### Community 84 - "Community 84"
Cohesion: 0.20
Nodes (7): ApiError, BASE_URL, FetchOptions, VerificationResult, VerificationResultSchema, submitVerification(), authClient

### Community 85 - "Community 85"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 89 - "Community 89"
Cohesion: 0.19
Nodes (11): Item, useBuyItem(), useShopItems(), BOOST_TYPES, CATEGORIES, Category, CONSUMABLE_TYPES, getItemIcon() (+3 more)

### Community 90 - "Community 90"
Cohesion: 0.06
Nodes (42): useApproveMember(), useCreateGuild(), useDeleteGuild(), useGuild(), useGuildLeaderboard(), useKickMember(), useLeaveGuild(), useUpdateGuild() (+34 more)

### Community 91 - "Community 91"
Cohesion: 0.33
Nodes (5): main, name, packageManager, private, version

### Community 92 - "Community 92"
Cohesion: 0.21
Nodes (9): Header(), HeaderProps, { useSession }, colors, ThemeColorKey, ThemeColors, useThemeColor(), LoginScreen() (+1 more)

### Community 93 - "Community 93"
Cohesion: 0.18
Nodes (10): chooseClass(), createClass(), deleteClass(), getClass(), getClasses(), updateClass(), ClassChoice, ClassChoiceSchema (+2 more)

### Community 94 - "Community 94"
Cohesion: 0.09
Nodes (28): useGuildMessages(), useGuildSocketIO(), useSendGuildMessage(), useUploadMessageAttachment(), GuildMessage, ChatComposer(), ChatComposerProps, ComposerAttachment (+20 more)

### Community 97 - "Community 97"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 98 - "Community 98"
Cohesion: 0.18
Nodes (11): getWebSocketToken(), registerPushToken(), PushToken, PushTokenSchema, updateTimezone(), RootNavigator(), queryClient, getProjectId() (+3 more)

### Community 100 - "Community 100"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 101 - "Community 101"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

### Community 102 - "Community 102"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 103 - "Community 103"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 104 - "Community 104"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 105 - "Community 105"
Cohesion: 0.19
Nodes (12): useUpdateQuestProgress(), LevelUpInfo, useSubmitVerification(), Button(), ButtonProps, SearchBar(), SearchBarProps, cn() (+4 more)

### Community 106 - "Community 106"
Cohesion: 0.18
Nodes (11): scripts, android, build:android:local, ios, lint, reset-project, start, test (+3 more)

### Community 107 - "Community 107"
Cohesion: 0.22
Nodes (7): CreateQuestBody, descriptionSchema, durationSchema, entriesSchema, entrySchema, nameSchema, submissionTypeSchema

### Community 108 - "Community 108"
Cohesion: 0.38
Nodes (6): useClassQuestsForAuthoring(), useDeleteQuest(), EditQuestListScreen(), typeFilters, typeLabels, typeTitles

### Community 110 - "Community 110"
Cohesion: 0.18
Nodes (10): 1. Ensure `EXPO_PUBLIC_API_URL` is set, 2. Start an emulator (or connect a device), 3. Build the Android debug APK, 4. Start Metro and run tests, E2E Tests (Maestro), Installing Maestro CLI, Notes, Prerequisites (+2 more)

## Knowledge Gaps
- **830 isolated node(s):** `__filename`, `__dirname`, `compat`, `eslintConfig`, `ItemUseAction` (+825 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `Community 4` to `Community 32`, `Community 0`, `Community 98`, `Community 5`, `Community 71`, `Community 39`, `Community 18`, `Community 84`, `Community 26`, `Community 92`, `Community 93`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `useThemeColor()` connect `Community 92` to `Community 0`, `Community 38`, `Community 39`, `Community 71`, `Community 105`, `Community 42`, `Community 107`, `Community 44`, `Community 108`, `Community 18`, `Community 24`, `Community 90`, `Community 94`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `GuildMember` connect `Community 90` to `Community 4`, `Community 5`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `__filename`, `__dirname`, `compat` to the rest of the system?**
  _830 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03636363636363636 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._