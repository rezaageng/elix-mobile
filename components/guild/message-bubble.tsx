import { useState } from "react"
import { Image } from "expo-image"
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native"

import type { GuildMessage } from "@/lib/api/schemas"
import { ImageViewerModal } from "@/components/profile/image-viewer-modal"

interface MessageBubbleProps {
  message: GuildMessage
  isOwn: boolean
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [viewerVisible, setViewerVisible] = useState(false)
  const { width: screenWidth } = useWindowDimensions()
  const hasAttachment = Boolean(message.attachmentUrl)

  const imageWidth = Math.min(screenWidth * 0.72, 340)
  const imageHeight = Math.min(imageWidth * 0.75, 300)

  return (
    <View className={`flex-row gap-xs ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn &&
        (message.user.image ? (
          <Image
            source={{ uri: message.user.image }}
            style={{ borderRadius: 9999, width: 24, height: 24 }}
            contentFit="cover"
            transition={200}
            accessibilityLabel={`${message.user.name}'s avatar`}
          />
        ) : (
          <View className="mt-auto h-6 w-6 items-center justify-center rounded-full bg-surface-card">
            <Text className="font-body-medium text-caption text-ink">
              {getInitial(message.user.name)}
            </Text>
          </View>
        ))}
      <View className={`max-w-[80%] gap-1 ${isOwn ? "items-end" : ""}`}>
        {!isOwn && (
          <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
            {message.user.name}
          </Text>
        )}

        <View
          className={`gap-xs overflow-hidden rounded-xl px-3 py-2 ${
            isOwn
              ? "bg-surface-soft dark:bg-surface-dark-soft"
              : "bg-surface-card dark:bg-surface-dark-elevated"
          }`}
        >
          {hasAttachment && (
            <>
              <TouchableOpacity
                onPress={() => setViewerVisible(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: message.attachmentUrl! }}
                  style={{
                    width: imageWidth,
                    height: imageHeight,
                    borderRadius: 8,
                    maxWidth: "100%",
                    marginTop: 4,
                  }}
                  contentFit="cover"
                  transition={200}
                  accessibilityLabel="Message attachment"
                />
              </TouchableOpacity>
              <ImageViewerModal
                visible={viewerVisible}
                uri={message.attachmentUrl!}
                onClose={() => setViewerVisible(false)}
              />
            </>
          )}
          {message.content && (
            <Text className="font-body text-body-sm text-body dark:text-on-dark-soft">
              {message.content}
            </Text>
          )}
          <Text
            className={`self-end font-body text-[10px] text-muted-soft ${
              message.content || hasAttachment ? "mt-1" : ""
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  )
}
