import { Image } from "expo-image"
import { Pencil, X } from "lucide-react-native"
import { useCallback } from "react"
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

interface ImageViewerModalProps {
  visible: boolean
  uri: string | undefined
  onClose: () => void
  onEdit?: () => void
}

const AnimatedImage = Animated.createAnimatedComponent(Image)

const MIN_SCALE = 1
const MAX_SCALE = 4
const DISMISS_SWIPE_THRESHOLD = 120

export function ImageViewerModal({
  visible,
  uri,
  onClose,
  onEdit,
}: ImageViewerModalProps) {
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(MIN_SCALE)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const originX = useSharedValue(0)
  const originY = useSharedValue(0)

  const reset = useCallback(() => {
    scale.value = withSpring(MIN_SCALE)
    translateX.value = withSpring(0)
    translateY.value = withSpring(0)
    originX.value = 0
    originY.value = 0
  }, [scale, translateX, translateY, originX, originY])

  const closeAndReset = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const nextScale = Math.min(
        Math.max(event.scale, MIN_SCALE),
        MAX_SCALE
      )
      scale.value = nextScale
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE + 0.1) {
        scale.value = withSpring(MIN_SCALE)
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
      }
    })

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > MIN_SCALE + 0.1) {
        translateX.value = event.translationX + originX.value
        translateY.value = event.translationY + originY.value
      } else {
        translateY.value = event.translationY
      }
    })
    .onEnd((event) => {
      if (scale.value <= MIN_SCALE + 0.1) {
        if (event.translationY > DISMISS_SWIPE_THRESHOLD) {
          runOnJS(closeAndReset)()
          return
        }
        translateY.value = withSpring(0)
        return
      }

      originX.value = translateX.value
      originY.value = translateY.value
    })

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE)
        translateX.value = withSpring(0)
        translateY.value = withSpring(0)
        originX.value = 0
        originY.value = 0
      } else {
        scale.value = withSpring(2)
      }
    })

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  )

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }))

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeAndReset}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
        <GestureHandlerRootView style={styles.container}>
          <GestureDetector gesture={composedGesture}>
            <View style={styles.container}>
              <TouchableOpacity
                onPress={closeAndReset}
                style={[styles.closeButton, { top: insets.top + 8 }]}
                activeOpacity={0.7}
              >
                <X size={24} color="#ffffff" />
              </TouchableOpacity>

              {uri && (
                <AnimatedImage
                  source={{ uri }}
                  style={[styles.image, animatedStyle]}
                  contentFit="contain"
                />
              )}

              {onEdit && (
                <TouchableOpacity
                  onPress={onEdit}
                  style={styles.editButton}
                  activeOpacity={0.7}
                >
                  <Pencil size={16} color="#ffffff" />
                  <Text className="font-body-medium text-body-sm text-white">
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    borderRadius: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 8,
  },
  editButton: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    transform: [{ translateX: -36 }],
  },
})
