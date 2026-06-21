import { useEffect, useState } from "react"
import { Image } from "expo-image"
import * as ImageManipulator from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import { Camera, ChevronRight, ImageIcon, Send, X } from "lucide-react-native"
import {
  Alert,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useThemeColor } from "@/lib/use-theme-color"

export interface ComposerAttachment {
  id: string
  localUri: string
  name: string
  type: string
  size?: number
}

interface ChatComposerProps {
  onSend: (content: string, attachments: ComposerAttachment[]) => void
}

let attachmentIdSequence = 0
export function makeAttachmentId(): string {
  attachmentIdSequence += 1
  return `${Date.now().toString(36)}-${attachmentIdSequence.toString(36)}`
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState("")
  const [expanded, setExpanded] = useState(true)
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const mutedColor = useThemeColor("muted")
  const { bottom: bottomInset } = useSafeAreaInsets()

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
    })
    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  useEffect(() => {
    if (text.trim().length > 0) {
      setExpanded(false)
    }
  }, [text])

  const removeAttachment = (id: string) => {
    setAttachments((previous) => previous.filter((item) => item.id !== id))
  }

  const compressImage = async (uri: string): Promise<string> => {
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1280 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    )
    return manipulated.uri
  }

  const handlePickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
    })

    if (result.canceled || !result.assets?.length) return

    try {
      const compressedAssets = await Promise.all(
        result.assets.map(async (asset) => ({
          uri: await compressImage(asset.uri),
          name: asset.fileName?.replace(/\.[^.]+$/, ".jpg") ?? "image.jpg",
          size: asset.fileSize,
        }))
      )

      setAttachments((previous) => [
        ...previous,
        ...compressedAssets.map((asset) => ({
          id: makeAttachmentId(),
          localUri: asset.uri,
          name: asset.name,
          type: "image/jpeg" as const,
          size: asset.size,
        })),
      ])
    } catch {
      Alert.alert("Image Error", "Could not process the selected images.")
    }
  }

  const handlePickCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    })

    if (result.canceled || !result.assets?.[0]) return

    try {
      const asset = result.assets[0]
      const compressedUri = await compressImage(asset.uri)
      const name = asset.fileName?.replace(/\.[^.]+$/, ".jpg") ?? "photo.jpg"
      setAttachments((previous) => [
        ...previous,
        {
          id: makeAttachmentId(),
          localUri: compressedUri,
          name,
          type: "image/jpeg",
          size: asset.fileSize,
        },
      ])
    } catch {
      Alert.alert("Camera Error", "Could not process the photo.")
    }
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return

    onSend(trimmed, attachments)
    setText("")
    setAttachments([])
    setExpanded(true)
  }

  const canSend = text.trim().length > 0 || attachments.length > 0

  return (
    <View
      className="bg-canvas dark:bg-surface-dark"
      style={{ paddingBottom: keyboardVisible ? 0 : bottomInset }}
    >
      {attachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="max-h-[100px]"
          contentContainerStyle={{ padding: 12, gap: 12 }}
        >
          {attachments.map((attachment) => (
            <View
              key={attachment.id}
              className="relative h-16 w-16 overflow-hidden rounded-lg bg-surface-card dark:bg-surface-dark-elevated"
            >
              <Image
                source={{ uri: attachment.localUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={200}
              />
              <TouchableOpacity
                onPress={() => removeAttachment(attachment.id)}
                className="absolute right-0 top-0 rounded-full bg-black/50 p-1"
                hitSlop={4}
              >
                <X size={10} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row items-center gap-xs px-md py-sm">
        {expanded ? (
          <>
            <TouchableOpacity
              onPress={handlePickGallery}
              activeOpacity={0.7}
              className="rounded-full  p-2 active:bg-surface-card dark:active:bg-surface-dark-elevated"
              accessibilityLabel="Attach from gallery"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ImageIcon size={24} color={mutedColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePickCamera}
              activeOpacity={0.7}
              className="rounded-full  p-2 active:bg-surface-card dark:active:bg-surface-dark-elevated"
              accessibilityLabel="Take a photo"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Camera size={24} color={mutedColor} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            activeOpacity={0.7}
            className="rounded-full p-sm active:bg-surface-card dark:active:bg-surface-dark-elevated"
            accessibilityLabel="Show attachment options"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronRight size={20} color={mutedColor} />
          </TouchableOpacity>
        )}

        <TextInput
          className={`flex-1 rounded-md border border-hairline bg-surface-soft px-sm py-2 font-body text-body-md leading-[1.25] text-ink dark:border-hairline dark:bg-surface-dark-soft dark:text-on-dark ${
            expanded ? "max-h-[44px]" : "max-h-[120px]"
          }`}
          value={text}
          onChangeText={setText}
          placeholder="Message your guild..."
          placeholderTextColor="#8e8b82"
          multiline
          numberOfLines={expanded ? 1 : 5}
          textAlignVertical="center"
          accessibilityLabel="Message input"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.7}
          className="rounded-full bg-primary p-sm active:bg-primary-active"
          accessibilityLabel="Send message"
        >
          <Send size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
