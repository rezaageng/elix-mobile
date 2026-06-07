import { useMemo, useRef, useState } from "react"
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
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

import { createQuests, useClassQuests } from "@/lib/api"
import type { CreateQuestBody } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

type SideQuestEntry = {
  key: number
  name: string
  description: string
  duration: string
  submissionType: "text" | "image"
  requiredQuestId: string | undefined
}

let nextKey = 0

function newEntry(): SideQuestEntry {
  return {
    key: nextKey++,
    name: "",
    description: "",
    duration: "3",
    submissionType: "text",
    requiredQuestId: undefined,
  }
}

export default function CreateSideQuestScreen() {
  const { classId, mainQuestIds } = useLocalSearchParams<{
    classId: string
    mainQuestIds: string
  }>()
  const { data: existingQuests } = useClassQuests(classId)
  const queryClient = useQueryClient()
  const router = useRouter()

  const errorColor = useThemeColor("error")
  const surfaceCardColor = useThemeColor("surface-card")
  const foregroundColor = useThemeColor("foreground")

  const mainIds = useMemo(
    () => (mainQuestIds ? mainQuestIds.split(",") : []),
    [mainQuestIds]
  )

  const mainQuestOptions = useMemo(() => {
    if (!existingQuests) return []
    return existingQuests
      .filter((quest) => quest.type === "main" && mainIds.includes(quest.id))
      .map((quest) => ({ id: quest.id, name: quest.name }))
  }, [existingQuests, mainIds])

  const [entries, setEntries] = useState<SideQuestEntry[]>([newEntry()])
  const [error, setError] = useState<string>()
  const [isPending, setIsPending] = useState(false)
  const [pickingEntryKey, setPickingEntryKey] = useState<number>()

  const sheetReference = useRef<BottomSheetModal>(null)

  const openPrereqSheet = (entryKey: number) => {
    setPickingEntryKey(entryKey)
    sheetReference.current?.present()
  }

  const selectPrereq = (questId: string) => {
    if (pickingEntryKey !== undefined) {
      updateEntry(pickingEntryKey, "requiredQuestId", questId)
    }
    sheetReference.current?.dismiss()
  }

  const updateEntry = (
    key: number,
    field: keyof SideQuestEntry,
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
      setError("At least one side quest is required")
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

      for (const entry of validEntries) {
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

      router.replace(`/roles/quests/create-recurring?classId=${classId}`)
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

  const renderPrerequisitePicker = (entry: SideQuestEntry) => {
    const selectedQuest = mainQuestOptions.find(
      (o) => o.id === entry.requiredQuestId
    )

    return (
      <View className="mb-sm gap-sm">
        <Text className="font-body text-caption text-muted dark:text-on-dark-soft">
          Prerequisite
        </Text>
        <TouchableOpacity
          onPress={() => openPrereqSheet(entry.key)}
          className="h-10 flex-row items-center justify-between rounded-md border border-hairline bg-canvas px-sm dark:border-hairline dark:bg-surface-dark"
        >
          <Text
            className={`font-body text-body-md ${
              selectedQuest ? "text-ink dark:text-on-dark" : "text-muted-soft"
            }`}
            numberOfLines={1}
          >
            {selectedQuest ? selectedQuest.name : "Select a main quest"}
          </Text>
          <ChevronDown size={16} color={foregroundColor} />
        </TouchableOpacity>
      </View>
    )
  }

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

          {entries.map((entry, index) => (
            <View
              key={entry.key}
              className="mb-md rounded-lg bg-surface-card p-lg dark:bg-surface-dark-elevated"
            >
              <View className="mb-xs flex-row items-center justify-between">
                <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
                  Side Quest {index + 1}
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

              {renderPrerequisitePicker(entry)}

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
                <View className="flex-row gap-xs">
                  <TouchableOpacity
                    onPress={() =>
                      updateEntry(entry.key, "submissionType", "text")
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
                      updateEntry(entry.key, "submissionType", "image")
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
          ))}

          <TouchableOpacity
            onPress={() => setEntries([...entries, newEntry()])}
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

          <Button onPress={handleSubmit} disabled={isPending}>
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="font-body-medium text-button text-primary-foreground">
                Next: Daily & Weekly Quests
              </Text>
            )}
          </Button>
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
          <Text className="mb-md px-xl font-body-medium text-title-sm text-ink dark:text-on-dark">
            Select Prerequisite
          </Text>
          <TouchableOpacity
            onPress={() => selectPrereq("")}
            className="flex-row items-center justify-between px-xl py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
          >
            <Text className="flex-1 font-body text-body-md text-muted dark:text-on-dark-soft">
              No prerequisite
            </Text>
            {pickingEntryKey !== undefined &&
              !entries.find((entry) => entry.key === pickingEntryKey)
                ?.requiredQuestId && (
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
              className="flex-row items-center justify-between px-xl py-md active:bg-surface-soft dark:active:bg-surface-dark-soft"
            >
              <Text className="flex-1 font-body text-body-md text-ink dark:text-on-dark">
                {option.name}
              </Text>
              {entries.find((entry) => entry.key === pickingEntryKey)
                ?.requiredQuestId === option.id && (
                <View className="ml-sm h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Text className="font-body-bold text-caption text-primary-foreground">
                    ✓
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  )
}
