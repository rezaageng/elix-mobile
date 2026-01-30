import { Link } from "expo-router"
import { Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useSession } from "@/lib/auth-client"

export default function Index() {
  const { data } = useSession()
  return (
    <SafeAreaView className="h-full w-full items-center justify-center bg-white dark:bg-black">
      <Text className="text-2xl text-black dark:text-white">
        Hello {data?.user.name}
      </Text>
      <Link href="/login" className="dark:text-white">
        Login
      </Link>
    </SafeAreaView>
  )
}
