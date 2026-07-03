import { Trophy } from "lucide-react-native"
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native"

import LeaderboardRow from "@/components/guild/leaderboard-row"
import { useGuildLeaderboard } from "@/lib/api/guilds"
import { useThemeColor } from "@/lib/use-theme-color"

interface LeaderboardTabProps {
  guildId: string
}

export default function LeaderboardTab({ guildId }: LeaderboardTabProps) {
  const { data: entries, isLoading, refetch, isRefetching } = useGuildLeaderboard(guildId)
  const mutedSoftColor = useThemeColor("muted-soft")

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#cc785c" />
      </View>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Trophy size={32} color={mutedSoftColor} />
        <Text className="mt-sm font-body text-body-sm text-muted">
          No activity this week yet
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 px-md">
      <View className="py-md">
        <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
          Weekly Leaderboard
        </Text>
        <Text className="font-body text-caption text-muted">
          Ranked by XP earned this week
        </Text>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View className="pb-sm">
            <LeaderboardRow
              entry={item}
              rank={index + 1}
              testID={`LeaderboardRow:${index + 1}`}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#cc785c"
            colors={["#cc785c"]}
          />
        }
      />
    </View>
  )
}
