import React from "react"
import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function GuildScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white dark:bg-black">
      <Text className="text-black dark:text-white">GuildScreen</Text>
    </SafeAreaView>
  )
}
