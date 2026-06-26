import AntDesign from "@expo/vector-icons/AntDesign"
import { Image } from "expo-image"
import { useState } from "react"
import { Text, TextInput, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { authClient, useSession } from "@/lib/auth-client"
import { useThemeColor } from "@/lib/use-theme-color"
import { Button } from "@/components/button"

export default function LoginScreen() {
  const { isPending } = useSession()
  const [developmentEmail, setDevelopmentEmail] = useState("")
  const [developmentPassword, setDevelopmentPassword] = useState("")

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

  const handleDevelopmentSignIn = async () => {
    await authClient.signIn.email({
      email: developmentEmail,
      password: developmentPassword,
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
          testID="LoginGoogle"
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
          testID="LoginTwitter"
        >
          <AntDesign name="twitter" size={20} color={iconColor} />
          <Text className="font-body-medium text-button text-ink dark:text-on-dark">
            Login with Twitter
          </Text>
        </Button>

        {(__DEV__ || process.env.EXPO_PUBLIC_E2E_ENABLED === "true") && (
          <View className="gap-2 border-t border-hairline pt-4">
            <Text className="text-center font-body text-body-sm text-muted dark:text-on-dark-soft">
              Development sign-in
            </Text>
            <TextInput
              testID="DevEmailInput"
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink dark:border-hairline dark:bg-surface-dark-elevated dark:text-on-dark"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={developmentEmail}
              onChangeText={setDevelopmentEmail}
            />
            <TextInput
              testID="DevPasswordInput"
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-ink dark:border-hairline dark:bg-surface-dark-elevated dark:text-on-dark"
              placeholder="Password"
              secureTextEntry
              value={developmentPassword}
              onChangeText={setDevelopmentPassword}
            />
            <Button
              onPress={handleDevelopmentSignIn}
              disabled={isPending || !developmentEmail || !developmentPassword}
              testID="DevSignInButton"
            >
              <Text className="font-body-medium text-button text-primary-foreground">
                Sign in
              </Text>
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
