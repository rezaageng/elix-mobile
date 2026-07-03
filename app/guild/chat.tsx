import { useQueryClient } from "@tanstack/react-query"
import { Stack, useLocalSearchParams } from "expo-router"
import { useCallback, useState } from "react"
import { View } from "react-native"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"
import { SafeAreaView } from "react-native-safe-area-context"

import ChatComposer, {
  type ComposerAttachment,
} from "@/components/guild/chat-composer"
import MessageList from "@/components/guild/message-list"
import {
  type PendingMessage,
} from "@/components/guild/pending-message-bubble"
import { useSendGuildMessage, useUploadMessageAttachment, useGuildSocketIO } from "@/lib/api/guilds"
import type { GuildMessage } from "@/lib/api/schemas"
import { useSession } from "@/lib/auth-client"
import { useHeaderOptions } from "@/lib/header-options"

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function GuildChatScreen() {
  const { guildId } = useLocalSearchParams<{ guildId: string }>()
  const { data: session } = useSession()
  const headerOptions = useHeaderOptions("Chat")
  const queryClient = useQueryClient()
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([])

  const sendMessage = useSendGuildMessage()
  const uploadAttachment = useUploadMessageAttachment()
  useGuildSocketIO(guildId)

  const updatePending = useCallback(
    (id: string, patch: Partial<PendingMessage>) => {
      setPendingMessages((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        )
      )
    },
    []
  )

  const removePending = useCallback((id: string) => {
    setPendingMessages((previous) =>
      previous.filter((item) => item.id !== id)
    )
  }, [])

  const addMessagesToCache = useCallback(
    (messages: GuildMessage[]) => {
      queryClient.setQueryData<GuildMessage[]>(
        ["guilds", guildId, "messages", undefined],
        (previous) => {
          if (!previous) return messages
          const existingIds = new Set(previous.map((message) => message.id))
          const newMessages = messages.filter(
            (message) => !existingIds.has(message.id)
          )
          return [...previous, ...newMessages]
        }
      )
    },
    [guildId, queryClient]
  )

  const sendPendingMessage = useCallback(
    async (pending: PendingMessage) => {
      updatePending(pending.id, { status: "sending" })

      try {
        const attachmentUrls: string[] = []
        for (const attachment of pending.attachments) {
          if (
            attachment.size !== undefined &&
            attachment.size > MAX_ATTACHMENT_BYTES
          ) {
            throw new Error(
              `${attachment.name} is too large (${formatSize(
                attachment.size
              )}). Maximum is 5 MB.`
            )
          }

          const formData = new FormData()
          formData.append("file", {
            uri: attachment.localUri,
            type: attachment.type,
            name: attachment.name,
          } as unknown as Blob)

          const data = await uploadAttachment.mutateAsync({
            guildId,
            formData,
          })
          attachmentUrls.push(data.url)
        }

        const sentMessages: GuildMessage[] = []
        if (pending.content && attachmentUrls.length === 0) {
          const message = await sendMessage.mutateAsync({
            guildId,
            body: { content: pending.content },
          })
          sentMessages.push(message)
        } else {
          for (const [index, url] of attachmentUrls.entries()) {
            const body: { content?: string; attachmentUrl?: string } = {
              attachmentUrl: url,
            }
            if (index === attachmentUrls.length - 1 && pending.content) {
              body.content = pending.content
            }
            const message = await sendMessage.mutateAsync({ guildId, body })
            sentMessages.push(message)
          }
        }

        addMessagesToCache(sentMessages)
        removePending(pending.id)
      } catch {
        updatePending(pending.id, { status: "failed" })
      }
    },
    [
      updatePending,
      addMessagesToCache,
      removePending,
      uploadAttachment,
      sendMessage,
      guildId,
    ]
  )

  const handleSend = useCallback(
    (content: string, attachments: ComposerAttachment[]) => {
      const pending: PendingMessage = {
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        content,
        attachments,
        status: "sending",
        createdAt: new Date().toISOString(),
      }
      setPendingMessages((previous) => [...previous, pending])
      sendPendingMessage(pending)
    },
    [sendPendingMessage]
  )

  const handleRetry = useCallback(
    (id: string) => {
      const pending = pendingMessages.find((item) => item.id === id)
      if (pending) sendPendingMessage(pending)
    },
    [pendingMessages, sendPendingMessage]
  )

  return (
    <SafeAreaView
      className="flex-1 bg-canvas dark:bg-surface-dark"
      edges={["left", "right"]}
    >
      <Stack.Screen options={headerOptions} />
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        automaticOffset
      >
        <View className="flex-1">
          <MessageList
            guildId={guildId}
            currentUserId={session?.user?.id}
            pendingMessages={pendingMessages}
            onRetry={handleRetry}
          />
          <ChatComposer onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
