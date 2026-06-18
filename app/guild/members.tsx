import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import MembersTab from "@/components/guild/members-tab"
import { useGuild } from "@/lib/api/guilds"
import { useSession } from "@/lib/auth-client"
import { useHeaderOptions } from "@/lib/header-options"

export default function GuildMembersScreen() {
  const router = useRouter()
  const { guildId } = useLocalSearchParams<{ guildId: string }>()
  const { data: session } = useSession()
  const { data: guildDetail, isLoading, refetch, isRefetching } = useGuild(guildId)
  const headerOptions = useHeaderOptions("Members")

  if (isLoading || !guildDetail) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-canvas dark:bg-surface-dark"
        edges={["left", "right", "bottom"]}
      >
        <Stack.Screen options={headerOptions} />
        <ActivityIndicator size="small" color="#cc785c" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      className="flex-1 bg-canvas dark:bg-surface-dark"
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={headerOptions} />
      <MembersTab
        guild={guildDetail}
        currentUserRole={
          guildDetail.members.find((m) => m.id === session?.user?.id)?.role
        }
        currentUserId={session?.user?.id}
        onLeftGuild={() => router.replace("/(tabs)/guild")}
        onRefresh={refetch}
        refreshing={isRefetching}
      />
    </SafeAreaView>
  )
}
