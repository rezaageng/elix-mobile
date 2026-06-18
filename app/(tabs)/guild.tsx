import { useEffect, useRef } from "react"
import { ActivityIndicator, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/button"
import DiscoveryScreen from "@/components/guild/discovery-screen"
import GuildHome from "@/components/guild/guild-home"
import { useMyGuilds } from "@/lib/api/guilds"
import { useSession } from "@/lib/auth-client"

export default function GuildScreen() {
  const { data: session } = useSession()
  const {
    data: myGuilds,
    isLoading,
    isError,
    refetch,
  } = useMyGuilds()
  const queryClient = useQueryClient()
  const previousUserId = useRef(session?.user?.id)

  useEffect(() => {
    if (
      previousUserId.current &&
      previousUserId.current !== session?.user?.id
    ) {
      queryClient.removeQueries({ queryKey: ["guilds"] })
    }
    previousUserId.current = session?.user?.id
  }, [session?.user?.id, queryClient])

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark">
        <ActivityIndicator size="large" color="#cc785c" />
      </SafeAreaView>
    )
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-md bg-canvas dark:bg-surface-dark">
        <Text className="font-body text-body-md text-muted dark:text-on-dark-soft">
          Could not load guilds
        </Text>
        <Button variant="primary" title="Retry" onPress={() => refetch()} />
      </SafeAreaView>
    )
  }

  const approvedGuild =
    myGuilds?.find((g) => g.status === "approved") ?? undefined

  const currentUserId = session?.user?.id

  // No guild → discovery
  if (!approvedGuild) {
    return (
      <SafeAreaView className="flex-1 bg-canvas dark:bg-surface-dark" edges={["top"]}>
        <DiscoveryScreen
          onGuildJoined={() => refetch()}
        />
      </SafeAreaView>
    )
  }

  // Has guild → home
  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-surface-dark" edges={[]}>
      <GuildHome
        guild={approvedGuild}
        currentUserId={currentUserId}
        onLeftGuild={() => refetch()}
      />
    </SafeAreaView>
  )
}
