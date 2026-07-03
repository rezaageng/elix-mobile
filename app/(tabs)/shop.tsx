import { useCallback, useMemo, useState, type ReactNode } from "react"
import { Coins, Flame, Sparkles, Timer } from "lucide-react-native"
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import {
  useBuyItem,
  useCurrentUser,
  useShopItems,
} from "@/lib/api"
import type { Item } from "@/lib/api/schemas"
import { cn } from "@/lib/utils"
import { Button } from "@/components/button"
import Header from "@/components/header"

type Category = "all" | "consumables" | "boosts"

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "consumables", label: "Consumables" },
  { key: "boosts", label: "Boosts" },
]

const CONSUMABLE_TYPES = new Set(["restore_streak", "deadline_extension"])
const BOOST_TYPES = new Set(["xp_boost", "gold_boost"])

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

function CategoryFilter({
  active,
  onChange,
}: {
  active: Category
  onChange: (category: Category) => void
}) {
  return (
    <View className="mb-4 h-10">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <View className="flex-row gap-2">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => onChange(cat.key)}
              testID={`ShopFilter${cat.label}`}
              className={cn("rounded-full px-4 py-2", {
                "bg-primary": active === cat.key,
                "bg-surface-card dark:bg-surface-dark-elevated": active !== cat.key,
              })}
            >
              <Text
                className={cn("font-body-medium text-body-sm", {
                  "text-primary-foreground": active === cat.key,
                  "text-ink dark:text-on-dark": active !== cat.key,
                })}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

function ShopItemCard({
  item,
  userGold,
  onBuy,
  isBuying,
}: {
  item: Item
  userGold: number
  onBuy: (item: Item) => void
  isBuying: boolean
}) {
  const canAfford = userGold >= item.price

  return (
    <View testID={`ShopItem:${item.id}`} className="rounded-xl bg-surface-card p-4 dark:bg-surface-dark-elevated">
      <View className="flex-row items-start gap-3">
        <View className="items-center justify-center rounded-full bg-canvas p-3 dark:bg-surface-dark">
          {getItemIcon(item.type, 20)}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-body-semibold text-body-md text-ink dark:text-on-dark">
              {item.name}
            </Text>
            <View className="rounded-full bg-canvas px-2 py-0.5 dark:bg-surface-dark">
              <Text className="font-body text-caption text-ink dark:text-on-dark">
                {getItemTypeLabel(item.type)}
              </Text>
            </View>
          </View>
          <Text className="mt-1 font-body text-body-sm text-muted dark:text-on-dark-soft">
            {item.description}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Coins size={14} color="#e8a55a" />
              <Text className="font-body-semibold text-body-sm text-accent-amber">
                {item.price} G
              </Text>
            </View>
            <Button
              title="Buy"
              variant="primary"
              className="px-4 py-2"
              disabled={!canAfford || isBuying}
              onPress={() => onBuy(item)}
              testID={`BuyButton:${item.id}`}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets()
  const { data: user, isPending: userLoading } = useCurrentUser()
  const {
    data: items,
    isPending: itemsLoading,
    error: itemsError,
    refetch: refetchItems,
  } = useShopItems()
  const buyItemMutation = useBuyItem()
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await refetchItems()
    setRefreshing(false)
  }, [refetchItems])

  const filteredItems = useMemo(() => {
    if (!items) return []
    const active = items.filter((item) => item.isActive)
    if (activeCategory === "all") return active
    if (activeCategory === "consumables")
      return active.filter((item) => CONSUMABLE_TYPES.has(item.type))
    if (activeCategory === "boosts")
      return active.filter((item) => BOOST_TYPES.has(item.type))
    return active
  }, [items, activeCategory])

  const handleBuy = useCallback(
    async (item: Item) => {
      if (!user || user.gold < item.price) {
        Alert.alert("Not enough gold", "You don't have enough gold to buy this item.")
        return
      }
      try {
        await buyItemMutation.mutateAsync({ itemId: item.id, body: { quantity: 1 } })
        Alert.alert("Purchased!", `You bought ${item.name}.`)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong."
        Alert.alert("Purchase failed", message)
      }
    },
    [buyItemMutation, user]
  )

  const isLoading = userLoading || itemsLoading

  let content: ReactNode
  if (isLoading) {
    content = (
      <View className="flex-1 items-center justify-center">
        <Text className="font-body text-body-md text-muted">Loading shop...</Text>
      </View>
    )
  } else if (itemsError) {
    content = (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-body text-body-md text-muted">
          Failed to load shop items.
        </Text>
        <Button title="Retry" variant="outline" onPress={() => refetchItems()} />
      </View>
    )
  } else if (filteredItems.length === 0) {
    content = (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
          No items for sale right now.
        </Text>
      </View>
    )
  } else {
    content = (
      <View className="gap-3">
        {filteredItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            userGold={user?.gold ?? 0}
            onBuy={handleBuy}
            isBuying={buyItemMutation.isPending}
          />
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView className="w-full flex-1 bg-canvas dark:bg-surface-dark">
      <Header
        title="Shop"
        titleAlign="left"
        canGoBack={false}
        right={user ? <GoldChip gold={user.gold} /> : undefined}
      />

      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: insets.bottom + 64 }}
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
