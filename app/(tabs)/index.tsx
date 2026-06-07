import { useRouter } from "expo-router"
import { Flame, Plus, Timer } from "lucide-react-native"
import { useRef, useState, type ReactNode } from "react"
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useClassQuests, useCurrentUser, useDeleteQuest } from "@/lib/api"
import type { ClassQuest } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"
import Header from "@/components/header"
import {
  QuestActionsSheet,
  type QuestActionsSheetReference,
} from "@/components/quest-actions-sheet"

type QuestTab = "all" | "main" | "side" | "weekly" | "daily" | "event"

const TABS: { key: QuestTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "main", label: "Main" },
  { key: "side", label: "Side" },
  { key: "event", label: "Event" },
  { key: "weekly", label: "Weekly" },
  { key: "daily", label: "Daily" },
]

const TYPE_ORDER: QuestTab[] = ["main", "side", "event", "weekly", "daily"]

function getQuestTypeLabel(tab: QuestTab): string {
  if (tab === "daily") return "Daily"
  if (tab === "weekly") return "Weekly"
  if (tab === "event") return "Event"
  return ""
}

function getEffectiveQuestValues(quest: ClassQuest) {
  const override = quest.overrides?.at(-1)
  return {
    name: override?.name ?? quest.name,
    description: override?.description ?? quest.description,
    duration: override?.duration ?? quest.duration,
    startsAt: override?.startsAt ?? quest.startsAt,
  }
}

function getQuestStatus(quest: ClassQuest): string {
  return quest.progress?.[0]?.status ?? "not_started"
}

function getQuestStatusLabel(quest: ClassQuest): string {
  const status = getQuestStatus(quest)
  if (status === "completed") return "Completed"
  if (status === "in_progress") return "In Progress"
  const effective = getEffectiveQuestValues(quest)
  if (status === "not_started" && effective.startsAt) {
    return new Date(effective.startsAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return "Not Started"
}

function isActive(quest: ClassQuest): boolean {
  return getQuestStatus(quest) !== "completed"
}

function sortQuests(quests: ClassQuest[]): ClassQuest[] {
  // eslint-disable-next-line unicorn/no-array-sort
  return [...quests].sort((a, b) => {
    const aActive = isActive(a)
    const bActive = isActive(b)
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1

    const aCompletedAt = a.progress?.[0]?.completedAt
    const bCompletedAt = b.progress?.[0]?.completedAt
    if (aCompletedAt && bCompletedAt) {
      return new Date(bCompletedAt).getTime() - new Date(aCompletedAt).getTime()
    }
    if (aCompletedAt) return -1
    if (bCompletedAt) return 1
    return 0
  })
}

function formatHours(hours: number): string {
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (days > 0 && remainingHours > 0) return `${days}d ${remainingHours}h`
  if (days > 0) return `${days}d`
  return `${hours}h`
}

function getEffectiveStartedAt(quest: ClassQuest): Date | undefined {
  const progress = quest.progress?.[0]
  if (progress?.startedAt) return new Date(progress.startedAt)

  // Auto-started: no prerequisite or prerequisite completed
  if (!quest.requiredQuestId) {
    return new Date(quest.createdAt)
  }

  return undefined
}

function getDurationInfo(
  quest: ClassQuest
): { text: string; isOverdue: boolean } | undefined {
  const status = getQuestStatus(quest)
  if (status === "completed") return undefined
  if (status === "not_started") {
    return { text: formatHours(quest.duration), isOverdue: false }
  }

  const startedAt = getEffectiveStartedAt(quest)
  if (!startedAt) {
    return { text: formatHours(quest.duration), isOverdue: false }
  }

  const deadline = startedAt.getTime() + quest.duration * 60 * 60 * 1000
  const now = Date.now()
  const diffMs = deadline - now

  if (diffMs < 0) {
    const overdueHours = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60))
    return { text: `Overdue ${formatHours(overdueHours)}`, isOverdue: true }
  }

  const remainingHours = Math.ceil(diffMs / (1000 * 60 * 60))
  return { text: `${formatHours(remainingHours)} left`, isOverdue: false }
}

function QuestCard({
  quest,
  onLongPress,
}: {
  quest: ClassQuest
  onLongPress?: () => void
}) {
  const router = useRouter()
  const status = getQuestStatus(quest)
  const completed = status === "completed"
  const effective = getEffectiveQuestValues(quest)
  const durationInfo = getDurationInfo({ ...quest, duration: effective.duration })

  const canManage =
    (quest.type === "daily" || quest.type === "weekly" || quest.type === "event") && !completed

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({ pathname: "/quest/[id]", params: { id: quest.id } })
      }
      onLongPress={canManage ? onLongPress : undefined}
      delayLongPress={400}
      className={cn(
        "rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated",
        completed && "opacity-60"
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text
            className={cn(
              "font-body-semibold text-body-md text-ink dark:text-on-dark",
              completed && "line-through"
            )}
          >
            {effective.name}
          </Text>
          {effective.description && (
            <Text
              numberOfLines={1}
              className={cn(
                "mt-1 font-body text-body-sm text-muted dark:text-on-dark-soft",
                completed && "line-through"
              )}
            >
              {effective.description}
            </Text>
          )}
          <View className="mt-2 flex-row items-center gap-2">
            <View className="rounded-full bg-canvas px-2 py-0.5 dark:bg-surface-dark">
              <Text className="font-body text-caption text-ink dark:text-on-dark">
                {quest.type}
              </Text>
            </View>
            <Text
              className={cn(
                "font-body text-caption",
                completed && "text-muted dark:text-on-dark-soft",
                !completed &&
                  status === "not_started" &&
                  effective.startsAt &&
                  "text-primary",
                !completed &&
                  !(status === "not_started" && effective.startsAt) &&
                  "text-muted dark:text-on-dark-soft"
              )}
            >
              {getQuestStatusLabel(quest)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-body-semibold text-body-sm text-primary">
            {quest.xpReward ?? 0} XP
          </Text>
          <Text className="mt-0.5 font-body text-caption text-muted dark:text-on-dark-soft">
            {quest.goldReward ?? 0} G
          </Text>
          {durationInfo && (
            <View className="mt-0.5 flex-row items-center gap-1">
              <Timer
                size={12}
                color={durationInfo.isOverdue ? "#c64545" : "#6c6a64"}
              />
              <Text
                className={cn(
                  "font-body text-caption",
                  durationInfo.isOverdue
                    ? "text-error"
                    : "text-muted dark:text-on-dark-soft"
                )}
              >
                {durationInfo.text}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function hasCompletedQuestToday(quests: ClassQuest[]): boolean {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

  for (const quest of quests) {
    const completedAt = quest.progress?.[0]?.completedAt
    if (completedAt) {
      const completedDate = new Date(completedAt)
      if (completedDate >= startOfToday && completedDate < endOfToday) {
        return true
      }
    }
  }
  return false
}

function StreakBadge({
  streak,
  quests,
}: {
  streak: number
  quests: ClassQuest[]
}) {
  const active = hasCompletedQuestToday(quests)
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-surface-card px-3 py-1.5 dark:bg-surface-dark-elevated">
      <Flame
        size={18}
        color={active ? "#e8a55a" : "#8e8b82"}
      />
      <Text
        className={cn(
          "font-body-semibold text-body-sm",
          active ? "text-ink dark:text-on-dark" : "text-muted-soft dark:text-on-dark-soft"
        )}
      >
        {streak}
      </Text>
    </View>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mb-2 mt-4 flex-row items-center gap-2">
      <View className="dark:bg-hairline-dark h-px flex-1 bg-hairline" />
      <Text className="font-body-medium text-caption uppercase tracking-wider text-muted dark:text-on-dark-soft">
        {title}
      </Text>
      <View className="dark:bg-hairline-dark h-px flex-1 bg-hairline" />
    </View>
  )
}

export default function QuestScreen() {
  const router = useRouter()
  const { data: user, isPending: userLoading } = useCurrentUser()
  const classId = user?.activeClass?.id
  const {
    data: quests,
    isPending: questsLoading,
    refetch,
  } = useClassQuests(classId ?? "")
  const deleteQuestMutation = useDeleteQuest()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<QuestTab>("all")

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const isLoading = userLoading || (!!classId && questsLoading)
  const sheetReference = useRef<QuestActionsSheetReference>(null)

  const handleEditQuest = (questId: string, questType: string) => {
    if (!classId) return
    router.push({
      pathname: "/quest/manage" as any,
      params: { classId, type: questType, questId },
    })
  }

  const handleDeleteQuest = (questId: string) => {
    if (!classId) return
    Alert.alert("Delete Quest", "Are you sure you want to delete this quest?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteQuestMutation.mutate({ classId, questId })
        },
      },
    ])
  }

  const showAddButton =
    activeTab === "daily" || activeTab === "weekly" || activeTab === "event"

  let content: ReactNode
  if (!user?.activeClass) {
    content = (
      <View className="flex-1 items-center justify-center gap-md">
        <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
          You haven't chosen a role yet.
        </Text>
      </View>
    )
  } else if (isLoading) {
    content = (
      <View className="flex-1 items-center justify-center">
        <Text className="font-body text-body-md text-muted">
          Loading quests...
        </Text>
      </View>
    )
  } else {
    const allQuests = quests ?? []

    if (activeTab === "all") {
      const activeQuests = allQuests.filter((q) => isActive(q))
      if (activeQuests.length === 0) {
        content = (
          <View className="flex-1 items-center justify-center gap-md">
            <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
              No active quests.
            </Text>
          </View>
        )
      } else {
        const byType = new Map<QuestTab, ClassQuest[]>()
        for (const quest of activeQuests) {
          const type = quest.type as QuestTab
          if (!byType.has(type)) byType.set(type, [])
          byType.get(type)!.push(quest)
        }

        const sections: ReactNode[] = TYPE_ORDER.flatMap((type) => {
          const typeQuests = byType.get(type)
          if (!typeQuests || typeQuests.length === 0) return []
          return [
            <SectionHeader key={`header-${type}`} title={type} />,
            <View key={`list-${type}`} className="gap-3">
              {typeQuests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onLongPress={() =>
                    sheetReference.current?.open(quest.id, quest.type, quest.name)
                  }
                />
              ))}
            </View>,
          ]
        })

        content = <View className="pb-6">{sections}</View>
      }
    } else {
      const tabQuests = allQuests.filter((q) => q.type === activeTab)
      const sorted = sortQuests(tabQuests)

      if (sorted.length === 0) {
        content = (
          <View className="flex-1 items-center justify-center gap-md">
            <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
              No {activeTab} quests.
            </Text>
          </View>
        )
      } else {
        const active = sorted.filter((q) => isActive(q))
        const completed = sorted.filter((q) => !isActive(q))

        const sections: ReactNode[] = [
          active.length > 0 && (
            <SectionHeader key="header-active" title="In Progress" />
          ),
          active.length > 0 && (
            <View key="list-active" className="gap-3">
              {active.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onLongPress={() =>
                    sheetReference.current?.open(quest.id, quest.type, quest.name)
                  }
                />
              ))}
            </View>
          ),
          completed.length > 0 && (
            <SectionHeader key="header-completed" title="Completed" />
          ),
          completed.length > 0 && (
            <View key="list-completed" className="gap-3">
              {completed.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onLongPress={() =>
                    sheetReference.current?.open(quest.id, quest.type, quest.name)
                  }
                />
              ))}
            </View>
          ),
        ].filter(Boolean)

        content = <View className="pb-6">{sections}</View>
      }
    }
  }

  return (
    <SafeAreaView className="w-full flex-1 bg-canvas dark:bg-surface-dark">
      <Header
        title="Elix"
        canGoBack={false}
        right={
          user ? (
            <StreakBadge streak={user.streak} quests={quests ?? []} />
          ) : undefined
        }
      />

      <View className="mb-4 h-10">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: 16,
          }}
        >
          <View className="flex-row gap-2">
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-full px-4 py-2",
                  activeTab === tab.key
                    ? "bg-primary"
                    : "bg-surface-card dark:bg-surface-dark-elevated"
                )}
              >
                <Text
                  className={cn(
                    "font-body-medium text-body-sm",
                    activeTab === tab.key
                      ? "text-primary-foreground"
                      : "text-ink dark:text-on-dark"
                  )}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {showAddButton && classId && (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/quest/manage" as any,
                params: { classId, type: activeTab },
              })
            }
            className="mb-4 flex-row items-center justify-center gap-xs rounded-xl border border-dashed border-hairline bg-surface-card py-3 dark:border-hairline-dark dark:bg-surface-dark-elevated"
          >
            <Plus size={18} color="#6c6a64" />
            <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
              Add {getQuestTypeLabel(activeTab)} Quest
            </Text>
          </TouchableOpacity>
        )}
        {content}
      </ScrollView>

      <QuestActionsSheet
        ref={sheetReference}
        onEdit={handleEditQuest}
        onDelete={handleDeleteQuest}
      />
    </SafeAreaView>
  )
}
