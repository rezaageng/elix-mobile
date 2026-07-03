import { Image } from "expo-image"
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native"

import { useApproveMember } from "@/lib/api/guilds"
import type { GuildMember } from "@/lib/api/schemas"

interface PendingRequestsProps {
  guildId: string
  members: GuildMember[]
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

function PendingRequestRow({
  member,
  guildId,
}: {
  member: GuildMember
  guildId: string
}) {
  const approveMember = useApproveMember()

  const handleApprove = () => {
    approveMember.mutate({
      guildId,
      body: { userId: member.id, status: "approved" },
    })
  }

  const handleReject = () => {
    approveMember.mutate({
      guildId,
      body: { userId: member.id, status: "rejected" },
    })
  }

  const isPendingAction = approveMember.isPending

  return (
    <View className="flex-row items-center gap-sm rounded-lg border border-hairline bg-canvas p-md dark:bg-surface-dark">
      {member.image ? (
        <Image
          source={{ uri: member.image }}
          className="h-10 w-10 rounded-full"
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${member.name}'s avatar`}
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-card">
          <Text className="font-body-medium text-body-sm text-ink">
            {getInitial(member.name)}
          </Text>
        </View>
      )}
      <Text className="flex-1 font-body-medium text-body-sm text-ink dark:text-on-dark">
        {member.name}
      </Text>
      <View className="flex-row gap-sm">
        <TouchableOpacity
          onPress={handleApprove}
          disabled={isPendingAction}
          activeOpacity={0.7}
          className="rounded-md bg-primary px-3 py-1.5 active:bg-primary-active"
        >
          {isPendingAction ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="font-body-medium text-caption text-primary-foreground">
              Approve
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReject}
          disabled={isPendingAction}
          activeOpacity={0.7}
          className="rounded-md border border-hairline bg-surface-card px-3 py-1.5 active:bg-surface-soft dark:bg-surface-dark-elevated dark:active:bg-surface-dark-soft"
        >
          <Text className="font-body-medium text-caption text-ink dark:text-on-dark">
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function PendingRequests({
  guildId,
  members,
}: PendingRequestsProps) {
  const pendingMembers = members.filter((m) => m.status === "pending")

  if (pendingMembers.length === 0) return

  return (
    <View className="gap-sm">
      <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
        Pending Requests ({pendingMembers.length})
      </Text>
      {pendingMembers.map((member) => (
        <PendingRequestRow key={member.id} member={member} guildId={guildId} />
      ))}
    </View>
  )
}
