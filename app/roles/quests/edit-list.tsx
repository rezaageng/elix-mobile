import { useMemo } from "react"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { Pencil, Plus, Trash2 } from "lucide-react-native"
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useClassQuestsForAuthoring, useDeleteQuest } from "@/lib/api"
import type { ClassQuest } from "@/lib/api/schemas"
import { useHeaderOptions } from "@/lib/header-options"
import { useThemeColor } from "@/lib/use-theme-color"

const typeFilters: Record<
  "main" | "side" | "recurring",
  (quest: ClassQuest) => boolean
> = {
  main: (quest) => quest.type === "main",
  side: (quest) => quest.type === "side",
  recurring: (quest) =>
    quest.type === "daily" || quest.type === "weekly" || quest.type === "event",
}

const typeTitles: Record<"main" | "side" | "recurring", string> = {
  main: "Main Quests",
  side: "Side Quests",
  recurring: "Daily & Weekly Quests",
}

const typeLabels: Record<"main" | "side" | "recurring", string> = {
  main: "main quest",
  side: "side quest",
  recurring: "daily/weekly quest",
}

export default function EditQuestListScreen() {
  const { classId, type } = useLocalSearchParams<{
    classId: string
    type: "main" | "side" | "recurring"
  }>()
  const router = useRouter()
  const { data: quests, isPending } = useClassQuestsForAuthoring(classId)
  const deleteQuestMutation = useDeleteQuest()
  const mutedColor = useThemeColor("muted")
  const errorColor = useThemeColor("error")

  const filter = typeFilters[type] ?? typeFilters.main
  const title = typeTitles[type] ?? typeTitles.main
  const label = typeLabels[type] ?? typeLabels.main

  const filteredQuests = useMemo(
    () => (quests ? quests.filter((quest) => filter(quest)) : []),
    [quests, filter]
  )

  const handleEdit = (quest: ClassQuest) => {
    router.push({
      pathname: "/quest/manage",
      params: { classId, type: quest.type, questId: quest.id },
    })
  }

  const handleAdd = () => {
    let createType = "main"
    if (type === "recurring") {
      createType = "daily"
    } else if (type === "side") {
      createType = "side"
    }
    router.push({
      pathname: "/quest/manage",
      params: { classId, type: createType },
    })
  }

  const handleDelete = (quest: ClassQuest) => {
    Alert.alert(
      "Delete Quest",
      `Are you sure you want to delete "${quest.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuestMutation.mutateAsync({ classId, questId: quest.id })
            } catch {
              Alert.alert("Delete Failed", "Failed to delete quest. Please try again.")
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
      <Stack.Screen options={useHeaderOptions(title)} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 48,
        }}
      >
        {isPending && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#cc785c" />
          </View>
        )}

        {!isPending && filteredQuests.length === 0 && (
          <View className="items-center py-12">
            <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
              No {label}s yet
            </Text>
          </View>
        )}

        {!isPending && filteredQuests.length > 0 && (
          <View className="gap-3">
            {filteredQuests.map((quest) => (
              <View
                key={quest.id}
                className="gap-2 rounded-lg bg-surface-card p-4 dark:bg-surface-dark-elevated"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-body-medium text-body-md text-ink dark:text-on-dark">
                    {quest.name}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <TouchableOpacity
                      onPress={() => handleEdit(quest)}
                      className="rounded-full p-2"
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Pencil size={16} color={mutedColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(quest)}
                      className="rounded-full p-2"
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={16} color={errorColor} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="font-body text-body-sm text-muted dark:text-on-dark-soft">
                  {quest.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={handleAdd}
          className="mt-4 flex-row items-center justify-center gap-2 rounded-lg border border-dashed border-hairline px-md py-md dark:border-hairline"
          activeOpacity={0.7}
        >
          <Plus size={18} color={mutedColor} />
          <Text className="font-body-medium text-body-sm text-muted dark:text-on-dark-soft">
            Add {label}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
