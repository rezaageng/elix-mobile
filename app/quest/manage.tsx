import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import {
  ActivityIndicator,
  Alert,
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
  useClassQuests,
  useCreateQuests,
  useCurrentUser,
  useDeleteQuest,
  useOverrideQuest,
  useStartQuestProgress,
  useUpdateQuest,
} from "@/lib/api"
import type { ClassQuest, CreateQuestBody } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { Button } from "@/components/button"
import { NativeDateTimePicker } from "@/components/native-datetime-picker"

function getEffectiveQuestValues(quest: ClassQuest) {
  const override = quest.overrides?.at(-1)
  return {
    name: override?.name ?? quest.name,
    description: override?.description ?? quest.description,
    duration: override?.duration ?? quest.duration,
    startsAt: override?.startsAt ?? quest.startsAt,
  }
}

const questSchema = z.object({
  name: z.string().min(1, "Quest name is required"),
  description: z.string().min(1, "Quest description is required"),
  duration: z.string().refine(
    (value) => {
      const number_ = Number.parseInt(value, 10)
      return !Number.isNaN(number_) && number_ >= 1
    },
    { message: "Duration must be a positive integer" }
  ),
  submissionType: z.enum(["text", "image"]),
  startsAt: z.date().optional(),
})

const nameSchema = z.string().min(1, "Quest name is required")
const descriptionSchema = z.string().min(1, "Quest description is required")
const durationSchema = z.string().refine(
  (value) => {
    const number_ = Number.parseInt(value, 10)
    return !Number.isNaN(number_) && number_ >= 1
  },
  { message: "Duration must be a positive integer" }
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

export default function ManageQuestScreen() {
  const { classId, type, questId } = useLocalSearchParams<{
    classId: string
    type: "daily" | "weekly" | "event"
    questId?: string
  }>()

  const isEditMode = !!questId
  const { data: user } = useCurrentUser()
  const { data: quests } = useClassQuests(classId)
  const existingQuest = quests?.find((q) => q.id === questId)
  const effective = existingQuest
    ? getEffectiveQuestValues(existingQuest)
    : undefined

  const router = useRouter()
  const headerOptions = useHeaderOptions(
    isEditMode ? "Edit Quest" : `New ${type} quest`
  )

  function getPickerMode(): "time" | "datetime" | "weekday" {
    if (type === "daily") return "time"
    if (type === "weekly") return "weekday"
    return "datetime"
  }

  const pickerMode = getPickerMode()

  const createQuestsMutation = useCreateQuests()
  const overrideQuestMutation = useOverrideQuest()
  const updateQuestMutation = useUpdateQuest()
  const deleteQuestMutation = useDeleteQuest()
  const startQuestProgressMutation = useStartQuestProgress()

  const [error, setError] = useState<string>()
  const [initialized, setInitialized] = useState(false)

  const isQuestAuthor = existingQuest?.authorId === user?.id

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      duration: "1",
      submissionType: "image" as "text" | "image",
      startsAt: undefined as Date | undefined,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = questSchema.safeParse(value)
        if (!result.success) {
          const errors: Record<string, string> = {}
          const issues = result.error?.issues
          if (issues) {
            for (const issue of issues) {
              const field = String(issue.path[0] ?? "")
              if (field && !errors[field]) {
                errors[field] = issue.message
              }
            }
          }
          if (Object.keys(errors).length > 0) return errors
          return "Please fix the form errors"
        }
      },
    },
    onSubmit: async ({ value }) => {
      setError(undefined)

      const trimmedName = value.name.trim()
      const trimmedDescription = value.description.trim()
      const parsedDuration = Number.parseInt(value.duration, 10) || 1

      try {
        if (isEditMode && questId) {
          await (isQuestAuthor
            ? updateQuestMutation.mutateAsync({
                classId,
                questId,
                body: {
                  name: trimmedName,
                  description: trimmedDescription,
                  duration: parsedDuration,
                  startsAt: value.startsAt
                    ? value.startsAt.toISOString()
                    : undefined,
                },
              })
            : overrideQuestMutation.mutateAsync({
                classId,
                questId,
                body: {
                  name: trimmedName,
                  description: trimmedDescription,
                  duration: parsedDuration,
                },
              }))
        } else {
          const body: CreateQuestBody = {
            name: trimmedName,
            description: trimmedDescription,
            type,
            submissionType: value.submissionType,
            duration: parsedDuration,
            startsAt: value.startsAt ? value.startsAt.toISOString() : undefined,
          }
          const createdQuests = await createQuestsMutation.mutateAsync({
            classId,
            body: [body],
          })
          const createdQuestId = createdQuests[0]?.id
          if (createdQuestId) {
            const isFuture =
              value.startsAt && value.startsAt.getTime() > Date.now()
            if (!isFuture) {
              await startQuestProgressMutation.mutateAsync({
                classId,
                questId: createdQuestId,
              })
            }
          }
        }

        router.back()
      } catch (catchedError) {
        setError(
          catchedError instanceof Error
            ? catchedError.message
            : "Failed to save quest"
        )
      }
    },
  })

  useEffect(() => {
    if (!effective || initialized) return
    form.setFieldValue("name", effective.name)
    form.setFieldValue("description", effective.description)
    form.setFieldValue("duration", String(effective.duration))
    if (existingQuest) {
      form.setFieldValue(
        "submissionType",
        existingQuest.submissionType as "text" | "image"
      )
      form.setFieldValue(
        "startsAt",
        existingQuest.startsAt ? new Date(existingQuest.startsAt) : undefined
      )
    }
    setInitialized(true)
  }, [effective, existingQuest, initialized, form])

  const isPending =
    createQuestsMutation.isPending ||
    overrideQuestMutation.isPending ||
    deleteQuestMutation.isPending ||
    startQuestProgressMutation.isPending

  const handleDelete = () => {
    if (!questId) return
    Alert.alert("Delete Quest", "Are you sure you want to delete this quest?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteQuestMutation.mutateAsync({ classId, questId })
            router.back()
          } catch (catchedError) {
            setError(
              catchedError instanceof Error
                ? catchedError.message
                : "Failed to delete quest"
            )
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...headerOptions,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <ChevronLeft size={28} color={headerOptions.headerTintColor} />
            </TouchableOpacity>
          ),
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
          <form.Field
            name="name"
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
              <View className="gap-sm">
                <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                  Name
                </Text>
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
            name="description"
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
              <View className="mt-md gap-sm">
                <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                  Description
                </Text>
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
            name="duration"
            validators={{
              onChange: ({ value }) => {
                const result = durationSchema.safeParse(value)
                if (!result.success) {
                  return (
                    getZodErrorMessage(result.error) ??
                    "Duration must be a positive integer"
                  )
                }
              },
            }}
          >
            {(field) => (
              <View className="mt-md gap-sm">
                <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                  Duration (hours)
                </Text>
                <TextInput
                  className="rounded-md border border-hairline bg-canvas px-sm py-1.5 font-body text-md text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder="Duration in hours"
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

          {(!isEditMode ||
            type === "daily" ||
            type === "weekly" ||
            type === "event") && (
            <form.Field name="startsAt">
              {(field) => (
                <View className="mt-md gap-sm">
                  <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                    {pickerMode === "time" ? "Start Time" : "Start Date & Time"}
                  </Text>
                  <NativeDateTimePicker
                    value={field.state.value}
                    onChange={(selectedDate) =>
                      field.handleChange(selectedDate)
                    }
                    mode={pickerMode}
                    label={
                      pickerMode === "time" ? "Start Time" : "Start Date & Time"
                    }
                  />
                </View>
              )}
            </form.Field>
          )}

          {!isEditMode && (
            <form.Field name="submissionType">
              {(field) => (
                <View className="mt-md gap-sm">
                  <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                    Submission Type
                  </Text>
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
                </View>
              )}
            </form.Field>
          )}

          {error && (
            <Text className="mt-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <View className="mt-xl gap-sm">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  onPress={form.handleSubmit}
                  disabled={isPending || isSubmitting}
                >
                  {isPending || isSubmitting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="font-body-medium text-button text-primary-foreground">
                      {isEditMode ? "Save Changes" : "Create Quest"}
                    </Text>
                  )}
                </Button>
              )}
            </form.Subscribe>

            {isEditMode && (
              <Button
                variant="destructive"
                onPress={handleDelete}
                disabled={isPending}
              >
                <Text className="font-body-medium text-button text-primary-foreground">
                  Delete Quest
                </Text>
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
