import "@/app/global.css"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from "@expo-google-fonts/playfair-display"
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

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === "login"

    if (!session && !inAuthGroup) {
      router.replace("/login")
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [session, isPending, segments, router])

  if (!fontsLoaded) return

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
