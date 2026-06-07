import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Plus, X } from "lucide-react-native"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  createQuests,
  deleteQuest,
  overrideQuest,
  startStarterQuests,
  updateQuest,
  useClassQuests,
  useCurrentUser,
} from "@/lib/api"
import type { CreateQuestBody } from "@/lib/api/schemas"
import { useSession } from "@/lib/auth-client"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"
import { NativeDateTimePicker } from "@/components/native-datetime-picker"

type QuestEntry = {
  key: number
  questId?: string
  name: string
  description: string
  duration: string
  submissionType: "text" | "image"
  startsAt?: Date
}

let nextKey = 0

function fromExisting(
  questId: string,
  name: string,
  description: string,
  duration: number,
  submissionType: "text" | "image",
  startsAt?: string
): QuestEntry {
  return {
    key: nextKey++,
    questId,
    name,
    description,
    duration: String(duration),
    submissionType,
    startsAt: startsAt ? new Date(startsAt) : undefined,
  }
}

function newEntry(): QuestEntry {
  return {
    key: nextKey++,
    name: "",
    description: "",
    duration: "1",
    submissionType: "image",
  }
}

function getQuestType(
  entry: QuestEntry,
  validDailies: QuestEntry[],
  validWeeklies: QuestEntry[]
): "daily" | "weekly" | "event" {
  if (validDailies.includes(entry)) return "daily"
  if (validWeeklies.includes(entry)) return "weekly"
  return "event"
}

export default function CreateRecurringQuestsScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const { data: existingQuests, isPending: isQuestsPending } =
    useClassQuests(classId)
  const { data: user } = useCurrentUser()
  const { refetch: refetchSession } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const mutedColor = useThemeColor("foregroundMuted")
  const headerOptions = useHeaderOptions("Daily & Weekly Quests")

  const [dailies, setDailies] = useState<QuestEntry[]>([newEntry()])
  const [weeklies, setWeeklies] = useState<QuestEntry[]>([newEntry()])
  const [events, setEvents] = useState<QuestEntry[]>([newEntry()])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  const isEditMode = useMemo(
    () =>
      !!existingQuests &&
      (existingQuests.some((q) => q.type === "daily") ||
        existingQuests.some((q) => q.type === "weekly") ||
        existingQuests.some((q) => q.type === "event")),
    [existingQuests]
  )

  useEffect(() => {
    if (!existingQuests || initialized) return

    // Only show role quests (shared) and current user's personal quests
    const visibleQuests = existingQuests.filter((q) => {
      const isRoleQuest = !q.authorId || q.authorId === user?.id
      const isOwnPersonal = q.authorId === user?.id
      return isRoleQuest || isOwnPersonal
    })

    const dailyQuests = visibleQuests
      .filter((q) => q.type === "daily")
      .map((q) =>
        fromExisting(
          q.id,
          q.name,
          q.description,
          q.duration,
          q.submissionType as "text" | "image",
          q.startsAt ?? undefined
        )
      )

    const weeklyQuests = visibleQuests
      .filter((q) => q.type === "weekly")
      .map((q) =>
        fromExisting(
          q.id,
          q.name,
          q.description,
          q.duration,
          q.submissionType as "text" | "image",
          q.startsAt ?? undefined
        )
      )

    const eventQuests = visibleQuests
      .filter((q) => q.type === "event")
      .map((q) =>
        fromExisting(
          q.id,
          q.name,
          q.description,
          q.duration,
          q.submissionType as "text" | "image",
          q.startsAt ?? undefined
        )
      )

    if (dailyQuests.length > 0) setDailies(dailyQuests)
    if (weeklyQuests.length > 0) setWeeklies(weeklyQuests)
    if (eventQuests.length > 0) setEvents(eventQuests)

    setInitialized(true)
  }, [existingQuests, initialized, user])

  const updateEntry = (
    list: QuestEntry[],
    setList: (value: QuestEntry[]) => void,
    key: number,
    field: keyof QuestEntry,
    value: string
  ) => {
    setList(
      list.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry
      )
    )
  }

  const removeEntry = (
    list: QuestEntry[],
    setList: (value: QuestEntry[]) => void,
    entry: QuestEntry
  ) => {
    if (list.length <= 1) return
    setList(list.filter((item) => item.key !== entry.key))
    if (entry.questId) {
      setRemovedIds((prev) => [...prev, entry.questId!])
    }
  }

  const handleSubmit = async () => {
    setError(undefined)

    const validDailies = dailies.filter(
      (entry) => entry.name.trim() && entry.description.trim()
    )
    const validWeeklies = weeklies.filter(
      (entry) => entry.name.trim() && entry.description.trim()
    )
    const validEvents = events.filter(
      (entry) => entry.name.trim() && entry.description.trim()
    )

    if (
      validDailies.length === 0 &&
      validWeeklies.length === 0 &&
      validEvents.length === 0
    ) {
      setError("Add at least one quest")
      return
    }

    try {
      setIsPending(true)
      const operations: Promise<unknown>[] = []

      // Delete removed quests
      for (const questId of removedIds) {
        operations.push(deleteQuest(classId, questId))
      }

      if (isEditMode) {
        // Update existing quests: authors use updateQuest, non-authors use overrideQuest
        // Both now support startsAt
        for (const entry of [...validDailies, ...validWeeklies, ...validEvents]) {
          if (!entry.questId) continue
          const existingQuest = existingQuests?.find((q) => q.id === entry.questId)
          const isQuestAuthor = existingQuest?.authorId === user?.id
          const baseBody = {
            name: entry.name.trim(),
            description: entry.description.trim(),
            duration: Number.parseInt(entry.duration, 10) || 1,
            startsAt: entry.startsAt
              ? entry.startsAt.toISOString()
              : undefined,
          }
          if (isQuestAuthor) {
            operations.push(updateQuest(classId, entry.questId, baseBody))
          } else {
            operations.push(overrideQuest(classId, entry.questId, baseBody))
          }
        }

        // Create new quests (entries without questId)
        const newDailyEntries = validDailies.filter((entry) => !entry.questId)
        const newWeeklyEntries = validWeeklies.filter((entry) => !entry.questId)
        const newEventEntries = validEvents.filter((entry) => !entry.questId)
        const newEntries = [
          ...newDailyEntries,
          ...newWeeklyEntries,
          ...newEventEntries,
        ]

        if (newEntries.length > 0) {
          const body: CreateQuestBody[] = newEntries.map((entry) => ({
            name: entry.name.trim(),
            description: entry.description.trim(),
            submissionType: entry.submissionType,
            duration: Number.parseInt(entry.duration, 10) || 1,
            type: getQuestType(entry, validDailies, validWeeklies),
            startsAt: entry.startsAt
              ? entry.startsAt.toISOString()
              : undefined,
          }))
          operations.push(createQuests(classId, body))
        }
      } else {
        // Create mode: bulk create all
        const dailyQuests: CreateQuestBody[] = validDailies.map((entry) => ({
          name: entry.name.trim(),
          description: entry.description.trim(),
          submissionType: entry.submissionType,
          duration: Number.parseInt(entry.duration, 10) || 1,
          type: "daily",
          startsAt: entry.startsAt
            ? entry.startsAt.toISOString()
            : undefined,
        }))
        const weeklyQuests: CreateQuestBody[] = validWeeklies.map((entry) => ({
          name: entry.name.trim(),
          description: entry.description.trim(),
          submissionType: entry.submissionType,
          duration: Number.parseInt(entry.duration, 10) || 1,
          type: "weekly",
          startsAt: entry.startsAt
            ? entry.startsAt.toISOString()
            : undefined,
        }))
        const eventQuests: CreateQuestBody[] = validEvents.map((entry) => ({
          name: entry.name.trim(),
          description: entry.description.trim(),
          submissionType: entry.submissionType,
          duration: Number.parseInt(entry.duration, 10) || 1,
          type: "event",
          startsAt: entry.startsAt
            ? entry.startsAt.toISOString()
            : undefined,
        }))
        operations.push(
          createQuests(classId, [
            ...dailyQuests,
            ...weeklyQuests,
            ...eventQuests,
          ])
        )
      }

      await Promise.all(operations)
      await startStarterQuests(classId)
      await queryClient.invalidateQueries({
        queryKey: ["classes", classId, "quests"],
      })
      await queryClient.refetchQueries({
        queryKey: ["classes", classId, "quests"],
      })
      await refetchSession()
      router.replace("/(tabs)")
    } catch (catchedError) {
      setError(
        catchedError instanceof Error
          ? catchedError.message
          : "Failed to save quests"
      )
    } finally {
      setIsPending(false)
    }
  }

  const renderQuestCard = (
    entry: QuestEntry,
    list: QuestEntry[],
    setList: (value: QuestEntry[]) => void,
    canRemove: boolean,
    label: string,
    pickerMode: "time" | "datetime" | "weekday"
  ) => (
    <View
      key={entry.key}
      className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
    >
      <View className="mb-sm flex-row items-center justify-between">
        <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
          {label}
        </Text>
        {canRemove && (
          <TouchableOpacity
            onPress={() => removeEntry(list, setList, entry)}
            className="rounded-full p-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
          >
            <X size={18} color={errorColor} />
          </TouchableOpacity>
        )}
      </View>
      <View className="gap-sm">
        <TextInput
          className="h-10 rounded-md border border-hairline bg-canvas px-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
          value={entry.name}
          onChangeText={(value) =>
            updateEntry(list, setList, entry.key, "name", value)
          }
          placeholder="Quest name"
          placeholderTextColor="#8e8b82"
          autoCapitalize="words"
        />
        <TextInput
          className="h-20 rounded-md border border-hairline bg-canvas p-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
          value={entry.description}
          onChangeText={(value) =>
            updateEntry(list, setList, entry.key, "description", value)
          }
          placeholder="Quest description"
          placeholderTextColor="#8e8b82"
          multiline
          textAlignVertical="top"
        />
        <TextInput
          className="h-10 rounded-md border border-hairline bg-canvas px-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
          value={entry.duration}
          onChangeText={(value) =>
            updateEntry(list, setList, entry.key, "duration", value)
          }
          placeholder="Duration (hours)"
          placeholderTextColor="#8e8b82"
          keyboardType="numeric"
        />
        <NativeDateTimePicker
          value={entry.startsAt}
          onChange={(selectedDate) =>
            setList(
              list.map((item) =>
                item.key === entry.key
                  ? { ...item, startsAt: selectedDate }
                  : item
              )
            )
          }
          mode={pickerMode}
          label={
            pickerMode === "time" ? "Start Time" : "Start Date & Time"
          }
        />
        <View className="flex-row gap-xs">
          <TouchableOpacity
            onPress={() =>
              updateEntry(list, setList, entry.key, "submissionType", "text")
            }
            className={`flex-1 items-center rounded-md border px-sm py-xs ${entry.submissionType === "text" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
          >
            <Text
              className={`font-body-medium text-caption ${entry.submissionType === "text" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
            >
              Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              updateEntry(list, setList, entry.key, "submissionType", "image")
            }
            className={`flex-1 items-center rounded-md border px-sm py-xs ${entry.submissionType === "image" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
          >
            <Text
              className={`font-body-medium text-caption ${entry.submissionType === "image" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
            >
              Image
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  if (isQuestsPending) {
    return (
      <SafeAreaView
        edges={["top"]}
        className="w-full flex-1 items-center justify-center bg-canvas dark:bg-surface-dark"
      >
        <ActivityIndicator size="large" color="#cc785c" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...headerOptions,
          // eslint-disable-next-line unicorn/no-null
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          className="flex-1"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Daily Quests Section */}
          <View className="mb-lg">
            <View className="mb-sm flex-row items-center justify-between">
              <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                Daily Quests
              </Text>
              <TouchableOpacity
                onPress={() => setDailies([...dailies, newEntry()])}
                className="flex-row items-center gap-xs rounded-md px-sm py-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
              >
                <Plus size={16} color={mutedColor} />
                <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            {dailies.map((entry, index) =>
              renderQuestCard(
                entry,
                dailies,
                setDailies,
                dailies.length > 1,
                `Daily Quest ${index + 1}`,
                "time"
              )
            )}
          </View>

          {/* Weekly Quests Section */}
          <View className="mb-lg">
            <View className="mb-sm flex-row items-center justify-between">
              <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                Weekly Quests
              </Text>
              <TouchableOpacity
                onPress={() => setWeeklies([...weeklies, newEntry()])}
                className="flex-row items-center gap-xs rounded-md px-sm py-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
              >
                <Plus size={16} color={mutedColor} />
                <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            {weeklies.map((entry, index) =>
              renderQuestCard(
                entry,
                weeklies,
                setWeeklies,
                weeklies.length > 1,
                `Weekly Quest ${index + 1}`,
                "weekday"
              )
            )}
          </View>

          {/* Event Quests Section */}
          <View className="mb-lg">
            <View className="mb-sm flex-row items-center justify-between">
              <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                Event Quests
              </Text>
              <TouchableOpacity
                onPress={() => setEvents([...events, newEntry()])}
                className="flex-row items-center gap-xs rounded-md px-sm py-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
              >
                <Plus size={16} color={mutedColor} />
                <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            {events.map((entry, index) =>
              renderQuestCard(
                entry,
                events,
                setEvents,
                events.length > 1,
                `Event Quest ${index + 1}`,
                "datetime"
              )
            )}
          </View>

          {error && (
            <Text className="mb-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <Button onPress={handleSubmit} disabled={isPending}>
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                {isEditMode ? "Save & Continue" : "Finish"}
              </Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
