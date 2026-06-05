import { useEffect, useState } from "react"
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

import {
  useClassQuests,
  useCreateQuests,
  useDeleteQuest,
  useOverrideQuest,
  useStartQuestProgress,
} from "@/lib/api"
import type { ClassQuest, CreateQuestBody } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { Button } from "@/components/button"

function getEffectiveQuestValues(quest: ClassQuest) {
  const override = quest.overrides?.at(-1)
  return {
    name: override?.name ?? quest.name,
    description: override?.description ?? quest.description,
    duration: override?.duration ?? quest.duration,
  }
}

export default function ManageQuestScreen() {
  const { classId, type, questId } = useLocalSearchParams<{
    classId: string
    type: "daily" | "weekly"
    questId?: string
  }>()

  const isEditMode = !!questId
  const { data: quests } = useClassQuests(classId)
  const existingQuest = quests?.find((q) => q.id === questId)
  const effective = existingQuest ? getEffectiveQuestValues(existingQuest) : undefined

  const router = useRouter()
  const headerOptions = useHeaderOptions(
    isEditMode ? "Edit Quest" : `New ${type} quest`
  )

  const createQuestsMutation = useCreateQuests()
  const overrideQuestMutation = useOverrideQuest()
  const deleteQuestMutation = useDeleteQuest()
  const startQuestProgressMutation = useStartQuestProgress()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("1")
  const [submissionType, setSubmissionType] = useState<"text" | "image">("image")
  const [error, setError] = useState<string>()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!effective || initialized) return
    setName(effective.name)
    setDescription(effective.description)
    setDuration(String(effective.duration))
    if (existingQuest) {
      setSubmissionType(existingQuest.submissionType as "text" | "image")
    }
    setInitialized(true)
  }, [effective, existingQuest, initialized])

  const isPending =
    createQuestsMutation.isPending ||
    overrideQuestMutation.isPending ||
    deleteQuestMutation.isPending ||
    startQuestProgressMutation.isPending

  const handleSubmit = async () => {
    setError(undefined)

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()
    const parsedDuration = Number.parseInt(duration, 10) || 1

    if (!trimmedName) {
      setError("Quest name is required")
      return
    }
    if (!trimmedDescription) {
      setError("Quest description is required")
      return
    }

    try {
      if (isEditMode && questId) {
        await overrideQuestMutation.mutateAsync({
          classId,
          questId,
          body: {
            name: trimmedName,
            description: trimmedDescription,
            duration: parsedDuration,
          },
        })
      } else {
        const body: CreateQuestBody = {
          name: trimmedName,
          description: trimmedDescription,
          type,
          submissionType,
          duration: parsedDuration,
        }
        const createdQuests = await createQuestsMutation.mutateAsync({ classId, body: [body] })
        const createdQuestId = createdQuests[0]?.id
        if (createdQuestId) {
          await startQuestProgressMutation.mutateAsync({ classId, questId: createdQuestId })
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
  }

  const handleDelete = () => {
    if (!questId) return
    Alert.alert(
      "Delete Quest",
      "Are you sure you want to delete this quest?",
      [
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
      ]
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
          <View className="gap-sm">
            <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
              Name
            </Text>
            <TextInput
              className="h-10 rounded-md border border-hairline bg-canvas px-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
              value={name}
              onChangeText={setName}
              placeholder="Quest name"
              placeholderTextColor="#8e8b82"
              autoCapitalize="words"
            />
          </View>

          <View className="mt-md gap-sm">
            <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
              Description
            </Text>
            <TextInput
              className="h-20 rounded-md border border-hairline bg-canvas p-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
              value={description}
              onChangeText={setDescription}
              placeholder="Quest description"
              placeholderTextColor="#8e8b82"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View className="mt-md gap-sm">
            <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
              Duration (hours)
            </Text>
            <TextInput
              className="h-10 rounded-md border border-hairline bg-canvas px-sm font-body text-body-md leading-tight text-ink dark:border-hairline dark:bg-surface-dark dark:text-on-dark"
              value={duration}
              onChangeText={setDuration}
              placeholder="Duration in hours"
              placeholderTextColor="#8e8b82"
              keyboardType="numeric"
            />
          </View>

          {!isEditMode && (
            <View className="mt-md gap-sm">
              <Text className="font-body-medium text-body-md text-ink dark:text-on-dark">
                Submission Type
              </Text>
              <View className="flex-row gap-xs">
                <TouchableOpacity
                  onPress={() => setSubmissionType("text")}
                  className={`flex-1 items-center rounded-md border px-sm py-xs ${submissionType === "text" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
                >
                  <Text
                    className={`font-body-medium text-caption ${submissionType === "text" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
                  >
                    Text
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSubmissionType("image")}
                  className={`flex-1 items-center rounded-md border px-sm py-xs ${submissionType === "image" ? "border-primary bg-primary/10" : "border-hairline bg-canvas dark:bg-surface-dark"}`}
                >
                  <Text
                    className={`font-body-medium text-caption ${submissionType === "image" ? "text-primary" : "text-muted dark:text-on-dark-soft"}`}
                  >
                    Image
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {error && (
            <Text className="mt-md font-body text-body-sm text-error">
              {error}
            </Text>
          )}

          <View className="mt-xl gap-sm">
            <Button onPress={handleSubmit} disabled={isPending}>
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="font-body-medium text-button text-primary-foreground">
                  {isEditMode ? "Save Changes" : "Create Quest"}
                </Text>
              )}
            </Button>

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
