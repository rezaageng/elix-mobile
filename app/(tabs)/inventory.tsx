import { useCallback, useState, type ReactNode } from "react"
import { useRouter } from "expo-router"
import { Coins, Flame, Sparkles, Timer } from "lucide-react-native"
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  useClassQuests,
  useCurrentUser,
  useInventory,
  useUseItem,
} from "@/lib/api"
import type { InventoryItem } from "@/lib/api/schemas"
import { Button } from "@/components/button"
import Header from "@/components/header"

function getItemIcon(type: string, size: number) {
  const color = "#cc785c"
  switch (type) {
    case "restore_streak": {
      return <Flame size={size} color={color} />
    }
    case "deadline_extension": {
      return <Timer size={size} color={color} />
    }
    case "xp_boost": {
      return <Sparkles size={size} color={color} />
    }
    case "gold_boost": {
      return <Coins size={size} color={color} />
    }
    default: {
      return <Sparkles size={size} color={color} />
    }
  }
}

function getItemTypeLabel(type: string): string {
  switch (type) {
    case "restore_streak":
    case "deadline_extension": {
      return "Consumable"
    }
    case "xp_boost":
    case "gold_boost": {
      return "Boost"
    }
    default: {
      return "Item"
    }
  }
}

function GoldChip({ gold }: { gold: number }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full bg-surface-card px-3 py-1.5 dark:bg-surface-dark-elevated">
      <Coins size={14} color="#e8a55a" />
      <Text className="font-body-semibold text-body-sm text-ink dark:text-on-dark">
        {gold} G
      </Text>
    </View>
  )
}

function InventoryCard({
  entry,
  onUse,
  isUsing,
}: {
  entry: InventoryItem
  onUse: (entry: InventoryItem) => void
  isUsing: boolean
}) {
  return (
    <View className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
      <View className="flex-row items-start gap-3">
        <View className="items-center justify-center rounded-full bg-canvas p-3 dark:bg-surface-dark">
          {getItemIcon(entry.item.type, 20)}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-body-semibold text-body-md text-ink dark:text-on-dark">
              {entry.item.name}
            </Text>
            <View className="rounded-full bg-canvas px-2 py-0.5 dark:bg-surface-dark">
              <Text className="font-body text-caption text-ink dark:text-on-dark">
                {getItemTypeLabel(entry.item.type)}
              </Text>
            </View>
          </View>
          <Text className="mt-1 font-body text-body-sm text-muted dark:text-on-dark-soft">
            {entry.item.description}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View className="rounded-full bg-canvas px-2.5 py-1 dark:bg-surface-dark">
              <Text className="font-body-semibold text-caption text-ink dark:text-on-dark">
                x{entry.quantity}
              </Text>
            </View>
            <Button
              title="Use"
              variant="primary"
              className="px-4 py-2"
              disabled={isUsing || entry.quantity < 1}
              onPress={() => onUse(entry)}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default function InventoryScreen() {
  const { data: user, isPending: userLoading } = useCurrentUser()
  const {
    data: inventory,
    isPending: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useInventory()
  const { data: quests } = useClassQuests(user?.activeClass?.id ?? "")
  const useItemMutation = useUseItem()
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetchInventory()
    setRefreshing(false)
  }, [refetchInventory])

  const handleUseItem = useCallback(
    async (entry: InventoryItem) => {
      if (entry.quantity < 1) return

      if (entry.item.type === "restore_streak") {
        if (!user?.restorableStreak) {
          Alert.alert(
            "No Streak to Restore",
            "You don't have a broken streak available to restore."
          )
          return
        }

        Alert.alert(
          "Restore Streak",
          `Restore your ${user.restorableStreak}-day streak? Your current streak of ${user.streak} will be replaced.`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Restore",
              onPress: async () => {
                try {
                  const result = await useItemMutation.mutateAsync({
                    itemId: entry.itemId,
                    body: { quantity: 1 },
                  })
                  Alert.alert("Streak restored", result.message)
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "Something went wrong."
                  Alert.alert("Could not restore streak", message)
                }
              },
            },
          ]
        )
        return
      }

      if (entry.item.type === "deadline_extension") {
        const inProgressQuests =
          quests?.filter((q) => q.progress?.[0]?.status === "in_progress") ?? []

        if (inProgressQuests.length === 0) {
          Alert.alert(
            "No active quests",
            "You don't have any quests in progress to extend the deadline for."
          )
          return
        }

        Alert.alert(
          "Extend Deadline",
          "Choose a quest to extend its deadline:",
          [
            { text: "Cancel", style: "cancel" },
            ...inProgressQuests.map((quest) => ({
              text: quest.name,
              onPress: async () => {
                try {
                  const result = await useItemMutation.mutateAsync({
                    itemId: entry.itemId,
                    body: { quantity: 1, targetQuestId: quest.id },
                  })
                  Alert.alert("Item used", result.message)
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : "Something went wrong."
                  Alert.alert("Could not use item", message)
                }
              },
            })),
          ]
        )
        return
      }

      try {
        const result = await useItemMutation.mutateAsync({
          itemId: entry.itemId,
          body: { quantity: 1 },
        })
        Alert.alert("Item used", result.message)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong."
        Alert.alert("Could not use item", message)
      }
    },
    [useItemMutation, quests, user]
  )

  const isLoading = userLoading || inventoryLoading

  let content: ReactNode
  if (isLoading) {
    content = (
      <View className="flex-1 items-center justify-center">
        <Text className="font-body text-body-md text-muted">Loading inventory...</Text>
      </View>
    )
  } else if (inventoryError) {
    content = (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-body text-body-md text-muted">
          Failed to load inventory.
        </Text>
        <Button title="Retry" variant="outline" onPress={() => refetchInventory()} />
      </View>
    )
  } else if (!inventory || inventory.length === 0) {
    content = (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
          Your inventory is empty.
        </Text>
        <Text className="font-body text-body-sm text-muted-soft dark:text-on-dark-soft">
          Visit the Shop to buy items.
        </Text>
        <Button
          title="Go to Shop"
          variant="outline"
          onPress={() => router.push("/(tabs)/shop")}
        />
      </View>
    )
  } else {
    content = (
      <View className="gap-3">
        {inventory.map((entry) => (
          <InventoryCard
            key={entry.id}
            entry={entry}
            onUse={handleUseItem}
            isUsing={useItemMutation.isPending}
          />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView className="w-full flex-1 bg-canvas dark:bg-surface-dark">
      <Header
        title="Inventory"
        canGoBack={false}
        right={user ? <GoldChip gold={user.gold} /> : undefined}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || refreshing}
            onRefresh={onRefresh}
            tintColor="#cc785c"
            colors={["#cc785c"]}
          />
        }
      >
        {content}
      </ScrollView>
    </SafeAreaView>
  )
}
