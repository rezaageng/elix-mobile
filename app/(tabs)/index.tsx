import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Index() {
  return (
    <SafeAreaView className="h-full w-full items-center justify-center bg-white dark:bg-black">
      <Text className="text-2xl text-black dark:text-white">Hello</Text>
    </SafeAreaView>
  )
}
