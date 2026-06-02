import { useState } from "react"
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

import { createQuests } from "@/lib/api"
import type { CreateQuestBody, Quest } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"
import { useHeaderOptions } from "@/lib/header-options"
import { Button } from "@/components/button"

type MainQuestEntry = {
  key: number
  name: string
  description: string
  duration: string
}

let nextKey = 0

function newEntry(): MainQuestEntry {
  return { key: nextKey++, name: "", description: "", duration: "7" }
}

export default function CreateMainQuestScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const [entries, setEntries] = useState<MainQuestEntry[]>([newEntry()])
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)

  const updateEntry = (
    key: number,
    field: keyof MainQuestEntry,
    value: string
  ) => {
    setEntries(
      entries.map((entry) =>
        entry.key === key ? { ...entry, [field]: value } : entry
      )
    )
  }

  const removeEntry = (key: number) => {
    if (entries.length <= 1) return
    setEntries(entries.filter((entry) => entry.key !== key))
  }

  const handleSubmit = async () => {
    setError(undefined)

    const validEntries = entries.filter(
      (entry) => entry.name.trim() && entry.description.trim()
    )

    if (validEntries.length === 0) {
      setError("At least one main quest is required")
      return
    }

    for (const entry of validEntries) {
      const durationNumber = Number.parseInt(entry.duration, 10)
      if (Number.isNaN(durationNumber) || durationNumber < 1) {
        setError('Duration must be at least 1 day for "' + entry.name + '"')
        return
      }
    }

    try {
      setIsPending(true)
      const createdQuests: Quest[] = []
      const createdIds: string[] = []
      let previousQuestId: string | undefined

      for (const entry of validEntries) {
        const quest: CreateQuestBody = {
          name: entry.name.trim(),
          description: entry.description.trim(),
          type: "main",
          duration: Number.parseInt(entry.duration, 10),
          classId,
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

      queryClient.setQueryData(["classes", classId, "quests"], createdQuests)

      router.replace({
        pathname: "/roles/quests/create-side",
        params: { classId, mainQuestIds: createdIds.join(",") },
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

          {entries.map((entry, index) => (
            <View
              key={entry.key}
              className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
            >
              <View className="mb-xs flex-row items-center justify-between">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Main Quest {index + 1}
                </Text>
                {entries.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeEntry(entry.key)}
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
                <TextInput
                  className="h-10 rounded-md border border-hairline bg-canvas px-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={entry.name}
                  onChangeText={(value) =>
                    updateEntry(entry.key, "name", value)
                  }
                  placeholder="Quest name"
                  placeholderTextColor="#8e8b82"
                  autoCapitalize="words"
                />
                <TextInput
                  className="h-20 rounded-md border border-hairline bg-canvas p-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
                  value={entry.description}
                  onChangeText={(value) =>
                    updateEntry(entry.key, "description", value)
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
                    updateEntry(entry.key, "duration", value)
                  }
                  placeholder="Duration (days)"
                  placeholderTextColor="#8e8b82"
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => setEntries([...entries, newEntry()])}
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

          <Button onPress={handleSubmit} disabled={isPending}>
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                Next: Create Side Quests
              </Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
