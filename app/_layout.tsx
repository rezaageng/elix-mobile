import "@/app/global.css"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  CrimsonPro_400Regular,
  CrimsonPro_400Regular_Italic,
} from "@expo-google-fonts/crimson-pro"
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter"
import { useFonts } from "expo-font"
import { Stack, useRouter, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"

import { useSession } from "@/lib/auth-client"
import { queryClient } from "@/lib/query-client"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { data: session, isPending } = useSession()
  const segments = useSegments()
  const router = useRouter()

  const [fontsLoaded, fontError] = useFonts({
    CrimsonPro_400Regular,
    CrimsonPro_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === "login"

    if (!session && !inAuthGroup) {
      router.replace("/login")
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [session, isPending, segments, router])

  if (!fontsLoaded && !fontError) return

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
