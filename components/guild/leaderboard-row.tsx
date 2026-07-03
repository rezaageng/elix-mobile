import { Image } from "expo-image"
import { Text, View } from "react-native"

import type { GuildLeaderboardEntry } from "@/lib/api/schemas"

interface LeaderboardRowProps {
  entry: GuildLeaderboardEntry
  rank: number
  testID?: string
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <Text className="w-8 text-center font-display text-title-lg text-accent-amber">
        🥇
      </Text>
    )
  }
  if (rank === 2) {
    return (
      <Text className="w-8 text-center font-display text-title-lg text-muted-soft">
        🥈
      </Text>
    )
  }
  if (rank === 3) {
    return (
      <Text className="w-8 text-center font-display text-title-lg text-primary">
        🥉
      </Text>
    )
  }
  return (
    <Text className="w-8 text-center font-body-medium text-body-sm text-muted">
      {rank}
    </Text>
  )
}

export default function LeaderboardRow({ entry, rank, testID }: LeaderboardRowProps) {
  return (
    <View className="flex-row items-center gap-sm rounded-lg bg-surface-card p-md dark:bg-surface-dark-elevated" testID={testID}>
      <RankBadge rank={rank} />
      {entry.image ? (
        <Image
          source={{ uri: entry.image }}
          style={{ height: 36, width: 36, borderRadius: 9999 }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${entry.name}'s avatar`}
        />
      ) : (
        <View className="h-9 w-9 items-center justify-center rounded-full bg-surface-card">
          <Text className="font-body-medium text-caption text-ink">
            {getInitial(entry.name)}
          </Text>
        </View>
      )}
      <Text className="flex-1 font-body-medium text-body-sm text-ink dark:text-on-dark">
        {entry.name}
      </Text>
      <Text className="font-body-medium text-body-sm text-primary">
        {entry.expThisWeek} XP
      </Text>
    </View>
  )
}
