import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft, Pencil, Trash2 } from "lucide-react-native"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useClassQuests, useCurrentUser, useDeleteQuest } from "@/lib/api"
import type { ClassQuest } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { cn } from "@/lib/utils"
import { Button } from "@/components/button"

function getEffectiveQuestValues(quest: ClassQuest) {
  const override = quest.overrides?.at(-1)
  return {
    name: override?.name ?? quest.name,
    description: override?.description ?? quest.description,
    duration: override?.duration ?? quest.duration,
  }
}

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: user } = useCurrentUser()
  const classId = user?.activeClass?.id
  const { data: quests } = useClassQuests(classId ?? "")
  const deleteQuestMutation = useDeleteQuest()

  const quest = quests?.find((q) => q.id === id)
  const effective = quest ? getEffectiveQuestValues(quest) : undefined
  const status = quest?.progress?.[0]?.status ?? "not_started"
  const completed = status === "completed"
  const canManage =
    (quest?.type === "daily" || quest?.type === "weekly") && !completed

  const router = useRouter()
  const baseOptions = useHeaderOptions(effective?.name ?? "Quest")

  const headerOptions = {
    ...baseOptions,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} className="mr-2">
        <ChevronLeft size={28} color={baseOptions.headerTintColor} />
      </TouchableOpacity>
    ),
  }

  const handleDelete = () => {
    if (!quest || !classId) return
    Alert.alert("Delete Quest", "Are you sure you want to delete this quest?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteQuestMutation.mutate(
            { classId, questId: quest.id },
            { onSuccess: () => router.back() }
          )
        },
      },
    ])
  }

  if (!quest) {
    return (
      <SafeAreaView
        edges={["bottom", "left", "right"]}
        className="w-full flex-1 bg-canvas px-md dark:bg-surface-dark"
      >
        <Stack.Screen options={headerOptions} />
        <View className="flex-1 items-center justify-center">
          <Text className="font-body text-body-md text-muted">
            Quest not found.
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas px-md dark:bg-surface-dark"
    >
      <Stack.Screen options={headerOptions} />

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mt-4 gap-4 pb-6">
          <View className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
            {effective?.description && (
              <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
                {effective.description}
              </Text>
            )}
            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-canvas px-3 py-1 dark:bg-surface-dark">
                <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
                  {quest.type}
                </Text>
              </View>
              <View className="rounded-full bg-canvas px-3 py-1 dark:bg-surface-dark">
                <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
                  {quest.submissionType}
                </Text>
              </View>
              <Text
                className={cn(
                  "font-body-medium text-caption",
                  completed
                    ? "text-muted dark:text-on-dark-soft"
                    : "text-primary"
                )}
              >
                {(() => {
                  if (completed) return "Completed"
                  if (status === "in_progress") return "In Progress"
                  return "Not Started"
                })()}
              </Text>
            </View>
          </View>

          <View className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
            <Text className="font-body-semibold text-body-md text-ink dark:text-on-dark">
              Rewards
            </Text>
            <View className="mt-2 flex-row gap-6">
              <View>
                <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                  XP
                </Text>
                <Text className="font-body-semibold text-body-md text-primary">
                  {quest.xpReward ?? 0}
                </Text>
              </View>
              <View>
                <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                  Gold
                </Text>
                <Text className="font-body-semibold text-body-md text-primary">
                  {quest.goldReward ?? 0}
                </Text>
              </View>
              <View>
                <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
                  Duration
                </Text>
                <Text className="font-body-semibold text-body-md text-ink dark:text-on-dark">
                  {effective?.duration ?? quest.duration}h
                </Text>
              </View>
            </View>
          </View>

          {canManage && (
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onPress={() =>
                  router.push({
                    pathname: "/quest/manage" as any,
                    params: {
                      classId,
                      type: quest.type,
                      questId: quest.id,
                    },
                  })
                }
              >
                <Pencil size={16} color="#6c6a64" />
                <Text className="font-body-medium text-button text-ink dark:text-on-dark">
                  Edit
                </Text>
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onPress={handleDelete}
                disabled={deleteQuestMutation.isPending}
              >
                <Trash2 size={16} color="#ffffff" />
                <Text className="font-body-medium text-button text-primary-foreground">
                  Delete
                </Text>
              </Button>
            </View>
          )}

          {!completed && (
            <Button
              onPress={() => {
                router.push({
                  pathname: "/quest/verify" as any,
                  params: {
                    questId: quest.id,
                    classId,
                  },
                })
              }}
            >
              <Text className="font-body-medium text-button text-primary-foreground">
                Submit Quest
              </Text>
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
