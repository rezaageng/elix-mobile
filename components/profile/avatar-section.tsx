import { Text, View } from "react-native"

import type { PublicUser } from "@/lib/api/schemas"

interface AvatarSectionProps {
  user: PublicUser
  totalQuests: number
}

export function AvatarSection({ user, totalQuests }: AvatarSectionProps) {
  const xpToNext = 1000
  const xpPercent = Math.min(100, Math.round((user.xp / xpToNext) * 100))

  return (
    <View className="gap-4 px-4 pb-4">
      {/* Name */}
      <View className="gap-1">
        <Text className="font-display text-display-sm text-ink dark:text-on-dark">
          {user.name}
        </Text>
        {user.displayUsername ? (
          <Text className="font-body text-body-sm text-muted">
            @{user.displayUsername}
          </Text>
        ) : undefined}
        {/* Level + Role */}
        <View className="flex-row items-center gap-2 pt-1">
          <View className="rounded-full bg-primary px-2 py-0.5">
            <Text className="font-body-bold text-caption text-on-primary">
              Lv {user.level}
            </Text>
          </View>
          {user.activeClass ? (
            <Text className="font-body-medium text-caption text-primary">
              {user.activeClass.name}
            </Text>
          ) : undefined}
        </View>
      </View>

      {/* XP Bar */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="font-body-medium text-caption text-muted">
            XP
          </Text>
          <Text className="font-body-medium text-caption text-muted">
            {user.xp} / {xpToNext} XP
          </Text>
        </View>
        <View className="h-2 w-full overflow-hidden rounded-full bg-surface-card dark:bg-surface-dark">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${xpPercent}%` }}
          />
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row gap-3">
        <StatItem value={totalQuests} label="Quests" />
        <StatItem value={user.streak} label="Streak" />
        <StatItem value={user.longestStreak} label="Best" />
      </View>
    </View>
  )
}

function StatItem({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <View className="flex-1 items-center gap-1.5 rounded-lg bg-surface-card p-3 dark:bg-surface-dark-elevated">
      <Text className="font-display text-display-xs text-ink dark:text-on-dark">
        {value}
      </Text>
      <Text className="font-body text-caption text-muted">{label}</Text>
    </View>
  )
}
