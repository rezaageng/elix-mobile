import "@/app/global.css"

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
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { QueryClientProvider } from "@tanstack/react-query"
import { useFonts } from "expo-font"
import { Stack, useRouter, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import { useSession } from "@/lib/auth-client"
import { queryClient } from "@/lib/query-client"
import { updateTimezone } from "@/lib/api/users"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
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

  if (!fontsLoaded && !fontError) return

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <RootNavigator />
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

function RootNavigator() {
  const { data: session, isPending } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === "login"
    const inRolesGroup = segments[0] === "roles"

    if (!session && !inAuthGroup) {
      router.replace("/login")
      return
    }

    if (!session) return

    const user = session.user
    const needsClass = !user.activeClassId

    if (inAuthGroup) {
      router.replace(needsClass ? "/roles" : "/(tabs)")
    } else if (needsClass && !inRolesGroup) {
      router.replace("/roles")
    }
  }, [session, isPending, segments, router])

  // Sync device timezone with backend
  useEffect(() => {
    if (!session) return
    const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (deviceTz) {
      updateTimezone(deviceTz).catch(() => {
        // Silently fail — not critical
      })
    }
  }, [session])

  return <Stack screenOptions={{ headerShown: false }} />
}
