import { useRef, useState } from "react"
import { Image } from "expo-image"
import { Pencil, Settings } from "lucide-react-native"
import {
  Animated,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { useClassQuests, useCurrentUser, useUserStats } from "@/lib/api"
import type { Class, ClassQuest, UserStats } from "@/lib/api/schemas"
import { useProfileSettings, type ProfileSettings } from "@/lib/settings-store"
import {
  ActivityTab,
  AvatarSection,
  CollectionsTab,
  SettingsSheet,
  StatsSection,
  type SettingsSheetReference,
} from "@/components/profile"

const BANNER_HEIGHT = 150
const HEADER_THRESHOLD = 100

type TabKey = "stats" | "activity" | "collections"

export default function ProfileScreen() {
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useCurrentUser()
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useUserStats(user?.id ?? "")
  const { data: quests } = useClassQuests(user?.activeClass?.id ?? "")
  const [refreshing, setRefreshing] = useState(false)
  const { data: settings } = useProfileSettings()
  const [activeTab, setActiveTab] = useState<TabKey>("stats")
  const settingsSheetReference = useRef<SettingsSheetReference>(null)
  const scrollY = useRef(new Animated.Value(0)).current

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchUser(), refetchStats()])
    setRefreshing(false)
  }

  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const headerBackground = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD],
    outputRange: isDark
      ? ["rgba(24, 23, 21, 0)", "rgba(24, 23, 21, 0.9)"]
      : ["rgba(250, 249, 245, 0)", "rgba(250, 249, 245, 0.9)"],
    extrapolate: "clamp",
  })

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const isLoading = userLoading || statsLoading

  if (isLoading && !user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-sm text-muted">
          Loading profile...
        </Text>
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-sm text-muted">
          Failed to load profile
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-surface-dark">
      {/* Floating Header */}
      <View
        className="absolute left-0 right-0 top-0 z-50"
        style={{ paddingTop: insets.top }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: headerBackground,
          }}
        />

        <View className="flex-row items-center justify-between px-4 py-3">
          <Animated.Text
            className="font-display text-display-sm text-ink dark:text-on-dark"
            style={{ opacity: headerOpacity }}
          >
            {user.displayUsername ?? user.username ?? user.name}
          </Animated.Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="rounded-full bg-black/20 p-2"
              activeOpacity={0.7}
            >
              <Pencil size={20} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => settingsSheetReference.current?.present()}
              className="rounded-full bg-black/20 p-2"
              activeOpacity={0.7}
            >
              <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cc785c"
            colors={["#cc785c"]}
            progressViewOffset={insets.top + 24}
          />
        }
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Full-width Banner */}
        <View style={{ height: BANNER_HEIGHT }}>
          {user.banner ? (
            <Image
              source={{ uri: user.banner }}
              style={{ width: "100%", height: BANNER_HEIGHT }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="h-full w-full bg-primary" />
          )}
        </View>

        {/* Avatar overlapping banner */}
        <View className="px-4">
          <View className="relative" style={{ marginTop: -40 }}>
            <View className="h-20 w-20 overflow-hidden rounded-full border-4 border-canvas dark:border-surface-dark">
              {user.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={{ width: 80, height: 80 }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View className="h-full w-full items-center justify-center bg-surface-card dark:bg-surface-dark">
                  <Text className="font-display text-display-md text-ink dark:text-on-dark">
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <AvatarSection
          user={user}
          totalQuests={stats?.allTime.questsCompleted ?? 0}
        />

        {/* Tabs */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-2">
            <TabButton
              label="Stats"
              isActive={activeTab === "stats"}
              onPress={() => setActiveTab("stats")}
            />
            <TabButton
              label="Activity"
              isActive={activeTab === "activity"}
              onPress={() => setActiveTab("activity")}
            />
            <TabButton
              label="Collections"
              isActive={activeTab === "collections"}
              onPress={() => setActiveTab("collections")}
            />
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-4 py-4">
          <TabContent
            activeTab={activeTab}
            stats={stats}
            quests={quests ?? []}
            settings={settings}
            classes={user.classes}
            activeClass={user.activeClass}
          />
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </Animated.ScrollView>

      {/* Settings Sheet */}
      <SettingsSheet ref={settingsSheetReference} />
    </View>
  )
}

function TabContent({
  activeTab,
  stats,
  quests,
  settings,
  classes,
  activeClass,
}: {
  activeTab: TabKey
  stats: UserStats | undefined
  quests: ClassQuest[]
  settings: ProfileSettings | undefined
  classes: Class[]
  activeClass: Class | null
}) {
  if (activeTab === "stats") {
    if (stats) {
      return <StatsSection stats={stats} />
    }
    return (
      <View className="items-center py-8">
        <Text className="font-body text-body-sm text-muted">
          No stats available
        </Text>
      </View>
    )
  }

  if (activeTab === "activity") {
    return (
      <ActivityTab quests={quests} showQuestNames={true} hideActivity={false} />
    )
  }

  return <CollectionsTab classes={classes} activeClass={activeClass} />
}

function TabButton({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 items-center rounded-full px-4 py-2 ${
        isActive
          ? "bg-primary"
          : "bg-surface-card dark:bg-surface-dark-elevated"
      }`}
    >
      <Text
        className={`font-body-medium text-body-sm ${
          isActive ? "text-primary-foreground" : "text-ink dark:text-on-dark"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}
