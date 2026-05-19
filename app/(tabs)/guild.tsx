import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function GuildScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-md bg-canvas dark:bg-surface-dark">
      <Text className="font-display text-display-sm text-ink dark:text-on-dark">
        GuildScreen
      </Text>
    </SafeAreaView>
  )
}
