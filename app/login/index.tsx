import AntDesign from "@expo/vector-icons/AntDesign"
import { Image } from "expo-image"
import { Text, useColorScheme, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@/components/button"

export default function LoginScreen() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaView className="relative h-full w-full justify-end bg-white dark:bg-black">
      <Image
        source={require("@/assets/images/login-background.jpeg")}
        contentFit="cover"
        style={{ width: "100%", height: "75%", position: "absolute", top: 0 }}
      />
      <View className="z-10 h-[40%] justify-center gap-8 rounded-[2rem] bg-white p-4 dark:bg-black">
        <Text className="text-center text-4xl font-semibold dark:text-white">
          Welcome to Elix
        </Text>

        <Button variant="secondary">
          <AntDesign
            name="google"
            size={20}
            color={colorScheme === "dark" ? "white" : "black"}
          />
          <Text className="dark:text-white">Login with Google</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
