import { Stack, useLocalSearchParams } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import LeaderboardTab from "@/components/guild/leaderboard-tab"
import { useHeaderOptions } from "@/lib/header-options"

export default function GuildLeaderboardScreen() {
  const { guildId } = useLocalSearchParams<{ guildId: string }>()
  const headerOptions = useHeaderOptions("Leaderboard")

  return (
    <SafeAreaView
      className="flex-1 bg-canvas dark:bg-surface-dark"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={headerOptions} />
      <LeaderboardTab guildId={guildId} />
    </SafeAreaView>
  )
}
