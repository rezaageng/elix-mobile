import "@/app/global.css"

import { useEffect } from "react"
import { Stack, useRouter, useSegments } from "expo-router"

import { useSession } from "@/lib/auth-client"

export default function RootLayout() {
  const { data: session, isPending } = useSession()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = segments[0] === "login"

    if (!session && !inAuthGroup) {
      router.replace("/login")
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)")
    }
  }, [session, isPending, segments, router])

  return <Stack screenOptions={{ headerShown: false }} />
}
