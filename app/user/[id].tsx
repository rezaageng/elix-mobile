import { useLocalSearchParams } from "expo-router"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { ProfileScreen } from "@/components/profile"

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-sm text-muted">
          User not found
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-surface-dark">
      <ProfileScreen userId={id} />
    </View>
  )
}
