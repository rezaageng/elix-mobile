import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useClassQuests, useCurrentUser } from "@/lib/api"
import { useHeaderOptions } from "@/lib/header-options"
import { cn } from "@/lib/utils"
import { Button } from "@/components/button"

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: user } = useCurrentUser()
  const classId = user?.activeClass?.id
  const { data: quests } = useClassQuests(classId ?? "")

  const quest = quests?.find((q) => q.id === id)
  const status = quest?.progress?.[0]?.status ?? "not_started"
  const completed = status === "completed"

  const router = useRouter()
  const baseOptions = useHeaderOptions(quest?.name ?? "Quest")

  const headerOptions = {
    ...baseOptions,
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} className="mr-2">
        <ChevronLeft size={28} color={baseOptions.headerTintColor} />
      </TouchableOpacity>
    ),
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
            {quest.description && (
              <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
                {quest.description}
              </Text>
            )}
            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-canvas px-3 py-1 dark:bg-surface-dark">
                <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
                  {quest.type}
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
                  {quest.duration}h
                </Text>
              </View>
            </View>
          </View>

          {!completed && (
            <Button
              onPress={() => {
                // TODO: implement submission
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
