import { useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
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
import { z } from "zod"
import {
  createQuests,
  deleteQuest,
  overrideQuest,
  startStarterQuests,
  updateQuest,
  useClassQuestsForAuthoring,
  useCurrentUser,
} from "@/lib/api"
import type { CreateQuestBody } from "@/lib/api/schemas"
import { useSession } from "@/lib/auth-client"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"
import { NativeDateTimePicker } from "@/components/native-datetime-picker"

const nameSchema = z.string().min(1, "Name is required")
const descriptionSchema = z.string().min(1, "Description is required")
const durationSchema = z.string().refine(
  (value) => {
    if (value === "") return false
    const number_ = Number.parseInt(value, 10)
    return !Number.isNaN(number_) && number_ > 0
  },
  "Duration must be a positive number"
)

function getZodErrorMessage(error: unknown): string | undefined {
  if (!error) return
  if (Array.isArray(error)) {
    return (error[0] as { message?: string })?.message
  }
  const zodError = error as {
    issues?: { message: string }[]
  }
  return zodError.issues?.[0]?.message
}

type QuestEntry = {
  questId?: string
  name: string
  description: string
  duration: string
  submissionType: "text" | "image"
  startsAt?: Date
}

function fromExisting(
  questId: string,
  name: string,
  description: string,
  duration: number,
  submissionType: "text" | "image",
  startsAt?: string
): QuestEntry {
  return {
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
  const { classId, returnTo } = useLocalSearchParams<{
    classId: string
    returnTo?: string
  }>()
  const { data: existingQuests, isPending: isQuestsPending } =
    useClassQuestsForAuthoring(classId)
  const { data: user } = useCurrentUser()
  const { refetch: refetchSession } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const mutedColor = useThemeColor("foregroundMuted")
  const headerOptions = useHeaderOptions("Daily & Weekly Quests")

  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  const keyCounter = useRef(0)
  const [dailyKeys, setDailyKeys] = useState<number[]>([keyCounter.current++])
  const [weeklyKeys, setWeeklyKeys] = useState<number[]>([keyCounter.current++])
  const [eventKeys, setEventKeys] = useState<number[]>([keyCounter.current++])

  const form = useForm({
    defaultValues: {
      dailies: [newEntry()],
      weeklies: [newEntry()],
      events: [newEntry()],
    },
    validators: {
      onSubmit: ({ value }) => {
        const validDailies = value.dailies.filter(
          (entry) => entry.name.trim() && entry.description.trim()
        )
        const validWeeklies = value.weeklies.filter(
          (entry) => entry.name.trim() && entry.description.trim()
        )
        const validEvents = value.events.filter(
          (entry) => entry.name.trim() && entry.description.trim()
        )

        if (
          validDailies.length === 0 &&
          validWeeklies.length === 0 &&
          validEvents.length === 0
        ) {
          return "Add at least one quest"
        }
      },
    },
    onSubmit: async ({ value }) => {
      setError(undefined)

      const validDailies = value.dailies.filter(
        (entry) => entry.name.trim() && entry.description.trim()
      )
      const validWeeklies = value.weeklies.filter(
        (entry) => entry.name.trim() && entry.description.trim()
      )
      const validEvents = value.events.filter(
        (entry) => entry.name.trim() && entry.description.trim()
      )

      try {
        setIsPending(true)
        const operations: Promise<unknown>[] = []

        // Delete removed quests (authors delete, non-authors hide via override)
        for (const questId of removedIds) {
          const existingQuest = existingQuests?.find((q) => q.id === questId)
          const isQuestAuthor = existingQuest?.authorId === user?.id
          if (isQuestAuthor) {
            operations.push(deleteQuest(classId, questId))
          } else {
            operations.push(overrideQuest(classId, questId, { hidden: true }))
          }
        }

        if (isEditMode) {
          // Update existing quests: authors use updateQuest, non-authors use overrideQuest
          for (const entry of [
            ...validDailies,
            ...validWeeklies,
            ...validEvents,
          ]) {
            if (!entry.questId) continue
            const existingQuest = existingQuests?.find(
              (q) => q.id === entry.questId
            )
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
          const newWeeklyEntries = validWeeklies.filter(
            (entry) => !entry.questId
          )
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
          const weeklyQuests: CreateQuestBody[] = validWeeklies.map(
            (entry) => ({
              name: entry.name.trim(),
              description: entry.description.trim(),
              submissionType: entry.submissionType,
              duration: Number.parseInt(entry.duration, 10) || 1,
              type: "weekly",
              startsAt: entry.startsAt
                ? entry.startsAt.toISOString()
                : undefined,
            })
          )
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
        if (user?.activeClass?.id === classId) {
          await startStarterQuests(classId)
        }
        await queryClient.invalidateQueries({
          queryKey: ["classes", classId, "quests"],
        })
        await queryClient.refetchQueries({
          queryKey: ["classes", classId, "quests"],
        })
        await queryClient.invalidateQueries({
          queryKey: ["classes", classId, "quests", "authoring"],
        })
        await queryClient.refetchQueries({
          queryKey: ["classes", classId, "quests", "authoring"],
        })
        await refetchSession()
        router.replace(returnTo === "profile" ? "/(tabs)/profile" : "/(tabs)")
      } catch (catchedError) {
        setError(
          catchedError instanceof Error
            ? catchedError.message
            : "Failed to save quests"
        )
      } finally {
        setIsPending(false)
      }
    },
  })

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

    const nextDailies =
      dailyQuests.length > 0 ? dailyQuests : [newEntry()]
    const nextWeeklies =
      weeklyQuests.length > 0 ? weeklyQuests : [newEntry()]
    const nextEvents =
      eventQuests.length > 0 ? eventQuests : [newEntry()]

    form.setFieldValue("dailies", nextDailies)
    form.setFieldValue("weeklies", nextWeeklies)
    form.setFieldValue("events", nextEvents)

    setDailyKeys(nextDailies.map(() => keyCounter.current++))
    setWeeklyKeys(nextWeeklies.map(() => keyCounter.current++))
    setEventKeys(nextEvents.map(() => keyCounter.current++))

    setInitialized(true)
  }, [existingQuests, form, initialized, user])

  const handleSubmit = async () => {
    setError(undefined)
    try {
      await form.handleSubmit()
    } catch (catchedError) {
      setError(
        catchedError instanceof Error
          ? catchedError.message
          : "Failed to save quests"
      )
    }
  }

  const renderQuestCard = (
    arrayName: "dailies" | "weeklies" | "events",
    index: number,
    canRemove: boolean,
    label: string,
    pickerMode: "time" | "datetime" | "weekday",
    onRemove: () => void
  ) => (
    <View
      key={`${arrayName}-${index}`}
      className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
    >
      <View className="mb-sm flex-row items-center justify-between">
        <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
          {label}
        </Text>
        {canRemove && (
          <TouchableOpacity
            onPress={onRemove}
            className="rounded-full p-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
          >
            <X size={18} color={errorColor} />
          </TouchableOpacity>
        )}
      </View>
      <View className="gap-sm">
        <form.Field
          name={`${arrayName}[${index}].name`}
          validators={{
            onChange: ({ value }) => {
              const result = nameSchema.safeParse(value)
              if (!result.success) {
                return getZodErrorMessage(result.error) ?? "Invalid name"
              }
            },
          }}
        >
          {(field) => (
            <View>
              <TextInput
                className="rounded-md border border-hairline bg-canvas px-sm py-1.5 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Quest name"
                placeholderTextColor="#8e8b82"
                autoCapitalize="words"
                textAlignVertical="center"
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-body text-body-sm text-error">
                  {field.state.meta.errors.map(String).join(", ")}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        <form.Field
          name={`${arrayName}[${index}].description`}
          validators={{
            onChange: ({ value }) => {
              const result = descriptionSchema.safeParse(value)
              if (!result.success) {
                return (
                  getZodErrorMessage(result.error) ?? "Invalid description"
                )
              }
            },
          }}
        >
          {(field) => (
            <View>
              <TextInput
                className="rounded-md border border-hairline bg-canvas px-sm py-2 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Quest description"
                placeholderTextColor="#8e8b82"
                multiline
                textAlignVertical="top"
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-body text-body-sm text-error">
                  {field.state.meta.errors.map(String).join(", ")}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        <form.Field
          name={`${arrayName}[${index}].duration`}
          validators={{
            onChange: ({ value }) => {
              const result = durationSchema.safeParse(value)
              if (!result.success) {
                return (
                  getZodErrorMessage(result.error) ?? "Invalid duration"
                )
              }
            },
          }}
        >
          {(field) => (
            <View>
              <TextInput
                className="rounded-md border border-hairline bg-canvas px-sm py-1.5 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Duration (hours)"
                placeholderTextColor="#8e8b82"
                keyboardType="numeric"
                textAlignVertical="center"
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-body text-body-sm text-error">
                  {field.state.meta.errors.map(String).join(", ")}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        <form.Field name={`${arrayName}[${index}].startsAt`}>
          {(field) => (
            <NativeDateTimePicker
              value={field.state.value}
              onChange={(selectedDate) => field.handleChange(selectedDate)}
              mode={pickerMode}
              label={
                pickerMode === "time" ? "Start Time" : "Start Date & Time"
              }
            />
          )}
        </form.Field>

        <form.Field name={`${arrayName}[${index}].submissionType`}>
          {(field) => (
            <View className="flex-row gap-xs">
              <TouchableOpacity
                onPress={() => field.handleChange("text")}
                className={`flex-1 items-center rounded-md border px-sm py-1.5 ${field.state.value === "text" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
              >
                <Text
                  className={`font-body-medium text-md ${field.state.value === "text" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
                >
                  Text
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => field.handleChange("image")}
                className={`flex-1 items-center rounded-md border px-sm py-1.5 ${field.state.value === "image" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
              >
                <Text
                  className={`font-body-medium text-md ${field.state.value === "image" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
                >
                  Image
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </form.Field>
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
            <Text className="mb-sm font-body-medium text-title-sm text-ink dark:text-on-dark">
              Daily Quests
            </Text>
            {dailyKeys.map((key, index) =>
              renderQuestCard(
                "dailies",
                index,
                dailyKeys.length > 1,
                `Daily Quest ${index + 1}`,
                "time",
                () => {
                  const current = form.getFieldValue("dailies")
                  if (current.length <= 1) return
                  const removedEntry = current[index]
                  form.setFieldValue(
                    "dailies",
                    current.filter((_, index_) => index_ !== index)
                  )
                  setDailyKeys(dailyKeys.filter((_, index_) => index_ !== index))
                  if (removedEntry.questId) {
                    setRemovedIds((prev) => [...prev, removedEntry.questId!])
                  }
                }
              )
            )}
            <TouchableOpacity
              onPress={() => {
                const current = form.getFieldValue("dailies")
                form.setFieldValue("dailies", [...current, newEntry()])
                setDailyKeys([...dailyKeys, keyCounter.current++])
              }}
              className="mt-sm flex-row items-center justify-center gap-xs rounded-md border border-dashed border-hairline bg-surface-card py-sm dark:border-hairline-dark dark:bg-surface-dark-elevated"
            >
              <Plus size={16} color={mutedColor} />
              <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                Add Daily Quest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Quests Section */}
          <View className="mb-lg">
            <Text className="mb-sm font-body-medium text-title-sm text-ink dark:text-on-dark">
              Weekly Quests
            </Text>
            {weeklyKeys.map((key, index) =>
              renderQuestCard(
                "weeklies",
                index,
                weeklyKeys.length > 1,
                `Weekly Quest ${index + 1}`,
                "weekday",
                () => {
                  const current = form.getFieldValue("weeklies")
                  if (current.length <= 1) return
                  const removedEntry = current[index]
                  form.setFieldValue(
                    "weeklies",
                    current.filter((_, index_) => index_ !== index)
                  )
                  setWeeklyKeys(weeklyKeys.filter((_, index_) => index_ !== index))
                  if (removedEntry.questId) {
                    setRemovedIds((prev) => [...prev, removedEntry.questId!])
                  }
                }
              )
            )}
            <TouchableOpacity
              onPress={() => {
                const current = form.getFieldValue("weeklies")
                form.setFieldValue("weeklies", [...current, newEntry()])
                setWeeklyKeys([...weeklyKeys, keyCounter.current++])
              }}
              className="mt-sm flex-row items-center justify-center gap-xs rounded-md border border-dashed border-hairline bg-surface-card py-sm dark:border-hairline-dark dark:bg-surface-dark-elevated"
            >
              <Plus size={16} color={mutedColor} />
              <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                Add Weekly Quest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Event Quests Section */}
          <View className="mb-lg">
            <Text className="mb-sm font-body-medium text-title-sm text-ink dark:text-on-dark">
              Event Quests
            </Text>
            {eventKeys.map((key, index) =>
              renderQuestCard(
                "events",
                index,
                eventKeys.length > 1,
                `Event Quest ${index + 1}`,
                "datetime",
                () => {
                  const current = form.getFieldValue("events")
                  if (current.length <= 1) return
                  const removedEntry = current[index]
                  form.setFieldValue(
                    "events",
                    current.filter((_, index_) => index_ !== index)
                  )
                  setEventKeys(eventKeys.filter((_, index_) => index_ !== index))
                  if (removedEntry.questId) {
                    setRemovedIds((prev) => [...prev, removedEntry.questId!])
                  }
                }
              )
            )}
            <TouchableOpacity
              onPress={() => {
                const current = form.getFieldValue("events")
                form.setFieldValue("events", [...current, newEntry()])
                setEventKeys([...eventKeys, keyCounter.current++])
              }}
              className="mt-sm flex-row items-center justify-center gap-xs rounded-md border border-dashed border-hairline bg-surface-card py-sm dark:border-hairline-dark dark:bg-surface-dark-elevated"
            >
              <Plus size={16} color={mutedColor} />
              <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
                Add Event Quest
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <Text className="mb-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {() => (
              <Button onPress={handleSubmit} disabled={isPending}>
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-body-medium text-button text-primary-foreground">
                    {isEditMode ? "Save & Continue" : "Finish"}
                  </Text>
                )}
              </Button>
            )}
          </form.Subscribe>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
