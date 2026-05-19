import AntDesign from "@expo/vector-icons/AntDesign"
import { Image } from "expo-image"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { authClient, useSession } from "@/lib/auth-client"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

export default function LoginScreen() {
  const { isPending } = useSession()

  const iconColor = useThemeColor("foreground")

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "elix://",
    })
  }

  const handleTwitterLogin = async () => {
    await authClient.signIn.social({
      provider: "twitter",
      callbackURL: "elix://",
    })
  }

  return (
    <SafeAreaView className="relative h-full w-full justify-end bg-canvas dark:bg-surface-dark">
      <Image
        source={require("@/assets/images/login-background.jpeg")}
        contentFit="cover"
        style={{ width: "100%", height: "75%", position: "absolute", top: 0 }}
      />
      <View className="z-10 h-[40%] justify-center gap-6 rounded-xl bg-canvas px-lg dark:bg-surface-dark">
        <Text className="text-center font-display text-display-md text-ink dark:text-on-dark">
          Welcome to Elix
        </Text>
        <Button
          variant="outline"
          onPress={handleGoogleLogin}
          disabled={isPending}
        >
          <AntDesign name="google" size={20} color={iconColor} />
          <Text className="font-body-medium text-button text-ink dark:text-on-dark">
            Login with Google
          </Text>
        </Button>
        <Button
          variant="outline"
          onPress={handleTwitterLogin}
          disabled={isPending}
        >
          <AntDesign name="twitter" size={20} color={iconColor} />
          <Text className="font-body-medium text-button text-ink dark:text-on-dark">
            Login with Twitter
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
