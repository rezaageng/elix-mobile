import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/button"

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-md bg-canvas dark:bg-surface-dark">
      <Text className="font-display text-display-sm text-ink dark:text-on-dark">
        Profile
      </Text>
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
