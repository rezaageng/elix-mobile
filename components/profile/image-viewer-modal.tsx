import { Image } from "expo-image"
import { Pencil, X } from "lucide-react-native"
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ImageViewerModalProps {
  visible: boolean
  uri: string | undefined
  onClose: () => void
  onEdit?: () => void
}

export function ImageViewerModal({ visible, uri, onClose, onEdit }: ImageViewerModalProps) {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1 bg-black/90"
        edges={["top", "bottom", "left", "right"]}
      >
        <View className="flex-1">
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 z-10 rounded-full bg-black/40 p-2"
            style={{ top: insets.top + 8 }}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          {uri && (
            <Image
              source={{ uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          )}

          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              className="absolute bottom-8 left-1/2 z-10 flex-row items-center gap-2 rounded-full bg-black/40 px-4 py-2"
              style={{ transform: [{ translateX: -36 }] }}
            >
              <Pencil size={16} color="#ffffff" />
              <Text className="font-body-medium text-body-sm text-white">
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  )
}
