import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function QuestScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white dark:bg-black">
      <Text className="text-black dark:text-white">QuestScreen</Text>
    </SafeAreaView>
  )
}
