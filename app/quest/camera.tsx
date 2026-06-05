import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import {
  Camera as CameraIcon,
  FlipHorizontal,
  X,
} from "lucide-react-native"
import { useCallback, useRef, useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  CameraView,
  useCameraPermissions,
  type CameraType,
} from "expo-camera"

// Module-level storage to pass image URI back from camera to verify screen
let pendingCameraImageUri: string | undefined

export function getPendingCameraImageUri(): string | undefined {
  return pendingCameraImageUri
}

export function clearPendingCameraImageUri(): void {
  pendingCameraImageUri = undefined
}

export default function CameraScreen() {
  const router = useRouter()
  useLocalSearchParams<{
    questId: string
    classId: string
  }>()

  const [cameraFacing, setCameraFacing] = useState<CameraType>("back")
  const cameraReference = useRef<CameraView>(null)

  const [cameraPermission, requestCameraPermission] = useCameraPermissions()

  const handleClose = useCallback(() => {
    pendingCameraImageUri = undefined
    router.back()
  }, [router])

  const handleCapture = useCallback(async () => {
    if (!cameraReference.current) return
    const photo = await cameraReference.current.takePictureAsync({
      quality: 0.8,
      base64: false,
    })
    if (photo?.uri) {
      pendingCameraImageUri = photo.uri
      router.back()
    }
  }, [router])

  if (!cameraPermission?.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <CameraIcon size={40} color="#a09d96" />
        <TouchableOpacity
          onPress={requestCameraPermission}
          className="mt-4 rounded-md bg-primary px-5 py-3"
        >
          <CameraIcon size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-surface-dark">
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        ref={cameraReference}
        style={{ flex: 1 }}
        facing={cameraFacing}
      />
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        className="absolute inset-0"
        pointerEvents="box-none"
      >
        <View className="flex-1 flex-col justify-between p-md">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleClose}
              className="rounded-full bg-surface-dark/60 p-2"
            >
              <X size={24} color="#faf9f5" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setCameraFacing((previous) =>
                  previous === "back" ? "front" : "back"
                )
              }
              className="rounded-full bg-surface-dark/60 p-2"
            >
              <FlipHorizontal size={24} color="#faf9f5" />
            </TouchableOpacity>
          </View>

          <View className="items-center pb-6">
            <TouchableOpacity
              onPress={handleCapture}
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-on-dark bg-on-dark/20"
            >
              <View className="h-14 w-14 rounded-full bg-on-dark" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}
