import AntDesign from "@expo/vector-icons/AntDesign"
import { Image } from "expo-image"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { authClient } from "@/lib/auth-client"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

export default function LoginScreen() {
  const iconColor = useThemeColor("foreground")

  const handleGoogleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    })
  }

  const handleTwitterLogin = async () => {
    await authClient.signIn.social({
      provider: "twitter",
      callbackURL: "/",
    })
  }

  return (
    <SafeAreaView className="relative h-full w-full justify-end bg-white dark:bg-black">
      <Image
        source={require("@/assets/images/login-background.jpeg")}
        contentFit="cover"
        style={{ width: "100%", height: "75%", position: "absolute", top: 0 }}
      />
      <View className="z-10 h-[40%] justify-center gap-8 rounded-[2rem] bg-white p-4 dark:bg-black">
        <Text className="text-center text-4xl font-semibold text-black dark:text-white">
          Welcome to Elix
        </Text>
        <Button variant="secondary" onPress={handleGoogleLogin}>
          <AntDesign name="google" size={20} color={iconColor} />
          <Text className="text-black dark:text-white">Login with Google</Text>
        </Button>
        <Button variant="secondary" onPress={handleTwitterLogin}>
          <AntDesign name="twitter" size={20} color={iconColor} />
          <Text className="text-black dark:text-white">Login with Twitter</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
