import { useMemo, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ChevronDown, X } from "lucide-react-native"
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

import { createQuests, useClassQuestsForAuthoring } from "@/lib/api"
import type { CreateQuestBody } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

const nameSchema = z.string().min(1, "Name is required")
const descriptionSchema = z.string().min(1, "Description is required")
const durationSchema = z
  .string()
  .refine(
    (value) => {
      const parsed = Number.parseInt(value, 10)
      return !Number.isNaN(parsed) && parsed >= 1
    },
    { message: "Duration must be at least 1 day" }
  )
const submissionTypeSchema = z.enum(["text", "image"])

const entrySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  duration: durationSchema,
  submissionType: submissionTypeSchema,
  requiredQuestId: z.string().optional(),
})

const entriesSchema = z
  .array(entrySchema)
  .min(1, "At least one side quest is required")

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

export default function CreateSideQuestScreen() {
  const { classId, returnTo } = useLocalSearchParams<{
    classId: string
    returnTo?: string
  }>()
  const { data: existingQuests } = useClassQuestsForAuthoring(classId)
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const surfaceCardColor = useThemeColor("surface-card")
  const foregroundColor = useThemeColor("foreground")

  const mainQuestOptions = useMemo(() => {
    if (!existingQuests) return []
    return existingQuests
      .filter((quest) => quest.type === "main")
      .map((quest) => ({ id: quest.id, name: quest.name }))
  }, [existingQuests])

  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const [pickingIndex, setPickingIndex] = useState<number>()
  const pickingIndexReference = useRef<number | undefined>(undefined)
  const keyCounter = useRef(1)
  const [entryKeys, setEntryKeys] = useState<number[]>([0])

  const sheetReference = useRef<BottomSheetModal>(null)

  const form = useForm({
    defaultValues: {
      entries: [
        {
          name: "",
          description: "",
          duration: "3",
          submissionType: "text" as "text" | "image",
          requiredQuestId: undefined as string | undefined,
        },
      ],
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = entriesSchema.safeParse(value.entries)
        if (!result.success) {
          const errors: Record<string, string> = {}
          const issues = result.error.issues
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

      try {
        setIsPending(true)

        for (const entry of value.entries) {
          const quest: CreateQuestBody = {
            name: entry.name.trim(),
            description: entry.description.trim(),
            type: "side",
            submissionType: entry.submissionType,
            duration: Number.parseInt(entry.duration, 10),
            // eslint-disable-next-line unicorn/no-null
            requiredQuestId: entry.requiredQuestId ?? null,
          }

          const result = await createQuests(classId, [quest])

          if (!result[0]?.id) {
            throw new Error("Failed to create side quest")
          }
        }

        queryClient.invalidateQueries({
          queryKey: ["classes", classId, "quests"],
        })
        queryClient.invalidateQueries({
          queryKey: ["classes", classId, "quests", "authoring"],
        })

        router.replace({
          pathname: "/roles/quests/create-recurring",
          params: { classId, ...(returnTo ? { returnTo } : {}) },
        })
      } catch (catchedError) {
        setError(
          catchedError instanceof Error
            ? catchedError.message
            : "Failed to create quests"
        )
      } finally {
        setIsPending(false)
      }
    },
  })

  const openPrereqSheet = (index: number) => {
    pickingIndexReference.current = index
    setPickingIndex(index)
    sheetReference.current?.present()
  }

  const selectPrereq = (questId: string) => {
    const index = pickingIndexReference.current
    if (index !== undefined) {
      form.setFieldValue(
        `entries[${index}].requiredQuestId`,
        questId || undefined
      )
    }
    sheetReference.current?.dismiss()
  }

  const addEntry = () => {
    const current = form.getFieldValue("entries")
    form.setFieldValue("entries", [
      ...current,
      {
        name: "",
        description: "",
        duration: "3",
        submissionType: "text" as "text" | "image",
        requiredQuestId: undefined,
      },
    ])
    setEntryKeys([...entryKeys, keyCounter.current++])
  }

  const removeEntry = (removeIndex: number) => {
    const current = form.getFieldValue("entries")
    if (current.length <= 1) return
    form.setFieldValue(
      "entries",
      current.filter((_, index) => index !== removeIndex)
    )
    setEntryKeys(entryKeys.filter((_, index) => index !== removeIndex))
  }

  const renderPrerequisitePicker = (index: number) => (
    <form.Field name={`entries[${index}].requiredQuestId`}>
      {(field) => {
        const selectedQuest = mainQuestOptions.find(
          (o) => o.id === field.state.value
        )

        return (
          <View className="mb-sm gap-sm">
            <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
              Prerequisite
            </Text>
            <TouchableOpacity
              onPress={() => openPrereqSheet(index)}
              className="flex-row items-center justify-between rounded-md border border-hairline bg-canvas px-sm py-1.5 dark:border-hairline dark:bg-surface-dark"
            >
              <Text
                className={`font-body text-md ${
                  selectedQuest
                    ? "text-ink dark:text-on-dark"
                    : "text-muted-soft"
                }`}
                numberOfLines={1}
              >
                {selectedQuest ? selectedQuest.name : "Select a main quest"}
              </Text>
              <ChevronDown size={16} color={foregroundColor} />
            </TouchableOpacity>
          </View>
        )
      }}
    </form.Field>
  )

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...useHeaderOptions("Side Quests"),
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
          <Text className="mb-sm font-body text-body-md text-muted dark:text-on-dark-soft">
            Side quests branch off main quests. Each side quest requires you to
            pick a main quest as its prerequisite.
          </Text>

          {entryKeys.map((key, index) => (
            <View
              key={key}
              className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
            >
              <View className="mb-xs flex-row items-center justify-between">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Side Quest {index + 1}
                </Text>
                {entryKeys.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEntry(index)}
                    className="rounded-full p-xs active:bg-surface-soft dark:active:bg-surface-dark-soft"
                  >
                    <X size={18} color={errorColor} />
                  </TouchableOpacity>
                )}
              </View>

              {renderPrerequisitePicker(index)}

              <View className="gap-sm">
                <form.Field
                  name={`entries[${index}].name`}
                  validators={{
                    onChange: ({ value }) => {
                      const result = nameSchema.safeParse(value)
                      if (!result.success) {
                        return (
                          getZodErrorMessage(result.error) ?? "Invalid name"
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
                        placeholder="Quest name"
                        placeholderTextColor="#8e8b82"
                        autoCapitalize="words"
                        textAlignVertical="center"
                        testID="QuestTitleInput"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className="mt-1 font-body text-body-sm text-error">
                          {field.state.meta.errors.map(String).join(", ")}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>
                <form.Field
                  name={`entries[${index}].description`}
                  validators={{
                    onChange: ({ value }) => {
                      const result = descriptionSchema.safeParse(value)
                      if (!result.success) {
                        return (
                          getZodErrorMessage(result.error) ??
                          "Invalid description"
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
                        testID="QuestDescriptionInput"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className="mt-1 font-body text-body-sm text-error">
                          {field.state.meta.errors.map(String).join(", ")}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>
                <form.Field
                  name={`entries[${index}].duration`}
                  validators={{
                    onChange: ({ value }) => {
                      const result = durationSchema.safeParse(value)
                      if (!result.success) {
                        return (
                          getZodErrorMessage(result.error) ??
                          "Invalid duration"
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
                        placeholder="Duration (days)"
                        placeholderTextColor="#8e8b82"
                        keyboardType="numeric"
                        textAlignVertical="center"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className="mt-1 font-body text-body-sm text-error">
                          {field.state.meta.errors.map(String).join(", ")}
                        </Text>
                      )}
                    </View>
                  )}
                </form.Field>
                <form.Field name={`entries[${index}].submissionType`}>
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
          ))}

          <TouchableOpacity
            onPress={addEntry}
            className="mb-lg flex-row items-center justify-center gap-xs rounded-lg border border-dashed border-hairline px-md py-md dark:border-hairline"
          >
            <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
              + Add Side Quest
            </Text>
          </TouchableOpacity>

          {error && (
            <Text className="mb-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {() => (
              <Button onPress={form.handleSubmit} disabled={isPending} testID="CreateQuest">
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-body-medium text-button text-primary-foreground">
                    Next: Daily & Weekly Quests
                  </Text>
                )}
              </Button>
            )}
          </form.Subscribe>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheetModal
        ref={sheetReference}
        index={0}
        snapPoints={["40%"]}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close"
          />
        )}
        enablePanDownToClose
        handleIndicatorStyle={{
          backgroundColor: useThemeColor("foregroundMuted"),
          width: 40,
          height: 4,
          borderRadius: 2,
        }}
        backgroundStyle={{
          backgroundColor: surfaceCardColor,
        }}
      >
        <BottomSheetView
          className="flex-1"
          style={{ backgroundColor: surfaceCardColor }}
        >
          {pickingIndex !== undefined && (
            <form.Field name={`entries[${pickingIndex}].requiredQuestId`}>
              {(field) => (
                <>
                  <Text className="mb-md px-xl font-body-medium text-title-sm text-ink dark:text-on-dark">
                    Select Prerequisite
                  </Text>
                  <TouchableOpacity
                    onPress={() => selectPrereq("")}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-xl py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
                  >
                    <Text className="flex-1 font-body text-body-md text-muted dark:text-on-dark-soft">
                      No prerequisite
                    </Text>
                    {field.state.value === undefined && (
                      <View className="ml-sm h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Text className="font-body-bold text-caption text-primary-foreground">
                          ✓
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {mainQuestOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => selectPrereq(option.id)}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between px-xl py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
                    >
                      <Text className="flex-1 font-body text-body-md text-ink dark:text-on-dark">
                        {option.name}
                      </Text>
                      {field.state.value === option.id && (
                        <View className="ml-sm h-5 w-5 items-center justify-center rounded-full bg-primary">
                          <Text className="font-body-bold text-caption text-primary-foreground">
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </form.Field>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  )
}
