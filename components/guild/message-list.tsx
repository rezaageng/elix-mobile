import { MessageSquare } from "lucide-react-native"
import { useEffect, useRef } from "react"
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  View,
  type FlatList as FlatListType,
} from "react-native"

import MessageBubble from "@/components/guild/message-bubble"
import PendingMessageBubble, {
  type PendingMessage,
} from "@/components/guild/pending-message-bubble"
import { useGuildMessages } from "@/lib/api/guilds"
import { buildListItems, formatDayLabel } from "@/lib/message-utils"
import type { ListItem } from "@/lib/message-utils"
import { useThemeColor } from "@/lib/use-theme-color"

interface MessageListProps {
  guildId: string
  currentUserId?: string
  pendingMessages?: PendingMessage[]
  onRetry?: (id: string) => void
}

export default function MessageList({
  guildId,
  currentUserId,
  pendingMessages = [],
  onRetry,
}: MessageListProps) {
  const { data: messages, isLoading } = useGuildMessages(guildId)
  const mutedSoftColor = useThemeColor("muted-soft")
  const listReference = useRef<FlatListType<ListItem>>(null)
  const items = messages
    ? buildListItems(messages, pendingMessages)
    : pendingMessages.map((item) => ({ type: "pending" as const, data: item }))

  const scrollToEnd = (animated = false) => {
    listReference.current?.scrollToEnd({ animated })
  }

  useEffect(() => {
    if (!isLoading && messages && messages.length > 0) {
      const timeout = setTimeout(() => scrollToEnd(false), 100)
      return () => clearTimeout(timeout)
    }
  }, [isLoading, messages])

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      scrollToEnd(true)
    })
    return () => showSubscription.remove()
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#cc785c" />
      </View>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <MessageSquare size={32} color={mutedSoftColor} />
        <Text className="mt-sm font-body text-body-sm text-muted">
          No messages yet. Say hello!
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={listReference}
      className="flex-1"
      data={items}
      keyExtractor={(item, index) =>
        item.type === "separator"
          ? `sep-${item.date.toISOString()}-${index}`
          : item.data.id
      }
      renderItem={({ item }) => {
        if (item.type === "separator") {
          return (
            <View className="items-center py-3">
              <View className="rounded-full bg-surface-card px-3 py-1 dark:bg-surface-dark-elevated">
                <Text className="font-body text-caption text-muted">
                  {formatDayLabel(item.date)}
                </Text>
              </View>
            </View>
          )
        }

        if (item.type === "pending") {
          return (
            <View className="px-md py-1">
              <PendingMessageBubble
                message={item.data}
                onRetry={() => onRetry?.(item.data.id)}
              />
            </View>
          )
        }

        return (
          <View className="px-md py-1">
            <MessageBubble
              message={item.data}
              isOwn={item.data.user.id === currentUserId}
            />
          </View>
        )
      }}
      keyboardDismissMode="on-drag"
      onContentSizeChange={() => scrollToEnd(false)}
      onLayout={() => scrollToEnd(false)}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: 12,
        justifyContent: items.length > 0 ? "flex-end" : "center",
      }}
    />
  )
}
