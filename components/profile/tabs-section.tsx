import { Text, View } from "react-native"

import type { Class, ClassQuest } from "@/lib/api/schemas"

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Recently"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getQuestStatus(quest: ClassQuest): string {
  return quest.progress?.[0]?.status ?? "not_started"
}

export function ActivityTab({
  quests,
  showQuestNames,
  hideActivity,
}: {
  quests: ClassQuest[]
  showQuestNames: boolean
  hideActivity: boolean
}) {
  if (hideActivity) {
    return (
      <View className="items-center py-12">
        <Text className="font-body text-body-sm text-muted">Activity hidden</Text>
      </View>
    )
  }

  const completed = quests
    .filter((q) => getQuestStatus(q) === "completed")
    .slice(0, 15)

  if (completed.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="font-body text-body-sm text-muted">No completed quests yet</Text>
      </View>
    )
  }

  return (
    <View className="gap-0">
      {completed.map((quest, index) => {
        const progress = quest.progress?.[0]
        const completedAt = progress?.completedAt
        const isLast = index === completed.length - 1

        return (
          <View key={quest.id} className="flex-row">
            {/* Timeline line */}
            <View className="items-center px-2">
              <View className="h-3 w-3 rounded-full bg-primary" />
              {!isLast && (
                <View className="w-px flex-1 bg-hairline" />
              )}
            </View>

            {/* Content */}
            <View className={`flex-1 pb-6 ${isLast ? "" : "border-b border-hairline"}`}>
              <View className="gap-1">
                <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
                  {showQuestNames ? quest.name : "Quest completed"}
                </Text>
                <View className="flex-row gap-2">
                  <Text className="font-body text-caption text-muted">
                    {formatDate(completedAt)}
                  </Text>
                  <Text className="font-body text-caption text-muted">
                    {formatTime(completedAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

export function CollectionsTab({
  classes,
  activeClass,
}: {
  classes: Class[]
  activeClass: Class | null
}) {
  if (classes.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="font-body text-body-sm text-muted">No classes joined</Text>
      </View>
    )
  }

  return (
    <View className="gap-3">
      {classes.map((cls) => {
        const isActive = activeClass?.id === cls.id
        return (
          <View
            key={cls.id}
            className={`gap-2 rounded-lg p-4 ${
              isActive
                ? "border border-primary bg-primary/5 dark:bg-primary/10"
                : "bg-surface-card dark:bg-surface-dark"
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Text
                className={`font-body-medium text-body-sm ${
                  isActive ? "text-primary" : "text-ink dark:text-on-dark"
                }`}
              >
                {cls.name}
              </Text>
              {isActive && (
                <View className="rounded-full bg-primary px-2 py-0.5">
                  <Text className="font-body-bold text-caption text-on-primary">
                    Active
                  </Text>
                </View>
              )}
            </View>
            <Text className="font-body text-caption text-muted">
              {cls.description}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
