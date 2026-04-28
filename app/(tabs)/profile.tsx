import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/button"

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-white dark:bg-black">
      <Text className="text-black dark:text-white">ProfileScreen</Text>
      <Button
        title="Log Out"
        variant="destructive"
        onPress={async () => {
          await authClient.signOut()
        }}
      />
    </SafeAreaView>
  )
}
