import { Image } from "expo-image"
import { RotateCcw } from "lucide-react-native"
import { useState } from "react"
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native"

import { ImageViewerModal } from "@/components/profile/image-viewer-modal"

export interface PendingAttachment {
  id: string
  localUri: string
  name: string
  type: string
  size?: number
}

export interface PendingMessage {
  id: string
  content: string
  attachments: PendingAttachment[]
  status: "sending" | "failed"
  createdAt: string
}

interface PendingMessageBubbleProps {
  message: PendingMessage
  onRetry: () => void
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function PendingMessageBubble({
  message,
  onRetry,
}: PendingMessageBubbleProps) {
  const [viewerVisible, setViewerVisible] = useState(false)
  const { width: screenWidth } = useWindowDimensions()

  const imageWidth = Math.min(screenWidth * 0.72, 340)
  const imageHeight = Math.min(imageWidth * 0.75, 300)

  const hasAttachment = message.attachments.length > 0
  const hasContent = message.content.length > 0

  return (
    <View className="flex-row flex-row-reverse gap-xs">
      <View className="max-w-[80%] gap-1 items-end">
        <View
          className={`gap-xs overflow-hidden rounded-xl bg-surface-soft px-3 py-2 dark:bg-surface-dark-soft ${
            message.status === "sending" ? "opacity-60" : ""
          }`}
        >
          {hasAttachment && (
            <>
              {message.attachments.map((attachment, index) => (
                <TouchableOpacity
                  key={attachment.id}
                  onPress={() => setViewerVisible(true)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: attachment.localUri }}
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      borderRadius: 8,
                    }}
                    contentFit="cover"
                    transition={200}
                    accessibilityLabel="Pending message attachment"
                  />
                  {index === 0 && (
                    <ImageViewerModal
                      visible={viewerVisible}
                      uri={attachment.localUri}
                      onClose={() => setViewerVisible(false)}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}
          {hasContent && (
            <Text className="font-body text-body-sm text-body dark:text-on-dark-soft">
              {message.content}
            </Text>
          )}
          <View className="mt-1 flex-row items-center gap-xs self-end">
            {message.status === "failed" && (
              <TouchableOpacity
                onPress={onRetry}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <RotateCcw size={14} color="#cc785c" />
              </TouchableOpacity>
            )}
            <Text className="font-body text-[10px] text-muted-soft">
              {formatMessageTime(message.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
