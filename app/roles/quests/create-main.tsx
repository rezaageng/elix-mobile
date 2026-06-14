import { useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { X } from "lucide-react-native"
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

import { createQuests } from "@/lib/api"
import type { CreateQuestBody, Quest } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"
import { useHeaderOptions } from "@/lib/header-options"
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
})

const entriesSchema = z
  .array(entrySchema)
  .min(1, "At least one main quest is required")

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

export default function CreateMainQuestScreen() {
  const { classId, returnTo } = useLocalSearchParams<{
    classId: string
    returnTo?: string
  }>()
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const keyCounter = useRef(1)
  const [entryKeys, setEntryKeys] = useState<number[]>([0])

  const form = useForm({
    defaultValues: {
      entries: [
        {
          name: "",
          description: "",
          duration: "7",
          submissionType: "text" as "text" | "image",
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
        const createdQuests: Quest[] = []
        const createdIds: string[] = []
        let previousQuestId: string | undefined

        for (const entry of value.entries) {
          const quest: CreateQuestBody = {
            name: entry.name.trim(),
            description: entry.description.trim(),
            type: "main",
            submissionType: entry.submissionType,
            duration: Number.parseInt(entry.duration, 10),
          }

          if (previousQuestId) {
            quest.requiredQuestId = previousQuestId
          }

          const result = await createQuests(classId, [quest])

          if (result[0]) {
            createdQuests.push(result[0])
            createdIds.push(result[0].id)
            previousQuestId = result[0].id
          }
        }

        queryClient.setQueryData(
          ["classes", classId, "quests"],
          createdQuests
        )

        router.replace({
          pathname: "/roles/quests/create-side",
          params: {
            classId,
            mainQuestIds: createdIds.join(","),
            ...(returnTo ? { returnTo } : {}),
          },
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

  const addEntry = () => {
    const current = form.getFieldValue("entries")
    form.setFieldValue("entries", [
      ...current,
      {
        name: "",
        description: "",
        duration: "7",
        submissionType: "text" as "text" | "image",
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

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="w-full flex-1 bg-canvas dark:bg-surface-dark"
    >
      <Stack.Screen
        options={{
          ...useHeaderOptions("Main Quests"),
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
          <Text className="mb-sm font-body text-body-sm text-muted dark:text-on-dark-soft">
            Main quests chain linearly. The first quest has no prerequisite.
            Each subsequent quest requires completing the quest above it.
          </Text>

          {entryKeys.map((key, index) => (
            <View
              key={key}
              className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
            >
              <View className="mb-xs flex-row items-center justify-between">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Main Quest {index + 1}
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

              {index > 0 && (
                <Text className="mb-sm font-body text-caption text-muted dark:text-on-dark-soft">
                  Prerequisite: Main Quest {index}
                </Text>
              )}

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
              + Add Main Quest
            </Text>
          </TouchableOpacity>

          {error && (
            <Text className="mb-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {() => (
              <Button onPress={form.handleSubmit} disabled={isPending}>
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="font-body-medium text-button text-primary-foreground">
                    Next: Create Side Quests
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
