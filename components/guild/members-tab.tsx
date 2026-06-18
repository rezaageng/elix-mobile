import { LogOut } from "lucide-react-native"
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native"

import { Button } from "@/components/button"
import MemberRow from "@/components/guild/member-row"
import PendingRequests from "@/components/guild/pending-requests"
import { useKickMember, useLeaveGuild, useUpdateMemberRole } from "@/lib/api/guilds"
import type { Guild, GuildMember } from "@/lib/api/schemas"

interface MembersTabProps {
  guild: Guild & { members: GuildMember[] }
  currentUserRole: string | undefined
  currentUserId?: string
  onLeftGuild: () => void
  onRefresh?: () => void
  refreshing?: boolean
}

export default function MembersTab({
  guild,
  currentUserRole,
  currentUserId,
  onLeftGuild,
  onRefresh,
  refreshing,
}: MembersTabProps) {
  const leaveGuild = useLeaveGuild()
  const updateRole = useUpdateMemberRole()
  const kickMember = useKickMember()

  const isOwner = currentUserRole === "owner"
  const isAdmin = currentUserRole === "admin" || currentUserRole === "owner"
  const canLeave =
    currentUserRole !== undefined && currentUserRole !== "owner"

  const approvedMembers = guild.members.filter(
    (m) => m.status === "approved"
  )

  const handleLeave = () => {
    Alert.alert(
      "Leave Guild",
      "Are you sure you want to leave this guild?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leaveGuild.mutate(guild.id, {
              onSuccess: () => {
                onLeftGuild()
              },
              onError: (error_) => {
                Alert.alert("Error", error_.message)
              },
            })
          },
        },
      ]
    )
  }

  const handleAction = (member: GuildMember) => {
    const isTargetAdmin = member.role === "admin"
    const isTargetOwner = member.role === "owner"
    const isSelf = member.id === currentUserId

    const options: {
      text: string
      style?: "destructive" | "cancel"
      onPress?: () => void
    }[] = []

    if (isOwner && !isTargetOwner) {
      options.push(
        isTargetAdmin
          ? { text: "Demote to Member", onPress: () => demoteMember(member) }
          : { text: "Promote to Admin", onPress: () => promoteMember(member) }
      )
    }

    if (isAdmin && !isSelf && !isTargetOwner) {
      options.push({
        text: "Kick",
        style: "destructive",
        onPress: () => confirmKick(member),
      })
    }

    options.push({ text: "Cancel", style: "cancel" })
    Alert.alert(member.name, "", options)
  }

  const confirmKick = (member: GuildMember) => {
    Alert.alert(
      "Kick Member",
      `Are you sure you want to kick ${member.name} from the guild?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Kick",
          style: "destructive",
          onPress: () => {
            kickMember.mutate(
              { guildId: guild.id, userId: member.id },
              {
                onError: (error_) => Alert.alert("Error", error_.message),
              }
            )
          },
        },
      ]
    )
  }

  const promoteMember = (member: GuildMember) => {
    updateRole.mutate(
      { guildId: guild.id, body: { userId: member.id, role: "admin" } },
      {
        onError: (error_) => Alert.alert("Error", error_.message),
      }
    )
  }

  const demoteMember = (member: GuildMember) => {
    updateRole.mutate(
      { guildId: guild.id, body: { userId: member.id, role: "member" } },
      {
        onError: (error_) => Alert.alert("Error", error_.message),
      }
    )
  }

  return (
    <ScrollView
      className="flex-1 px-md"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing ?? false}
          onRefresh={onRefresh}
          tintColor="#cc785c"
          colors={["#cc785c"]}
        />
      }
    >
      <View className="gap-lg py-md">
        {isAdmin && (
          <PendingRequests guildId={guild.id} members={guild.members} />
        )}

        <View className="gap-sm">
          <Text className="font-body-medium text-title-sm text-ink dark:text-on-dark">
            Members
          </Text>
          {approvedMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              guildId={guild.id}
              canManage={isAdmin}
              isCurrentUser={member.id === currentUserId}
              onActionSheet={handleAction}
            />
          ))}
        </View>

        {canLeave && (
          <View className="mt-xl">
            <Button
              variant="outline"
              title="Leave Guild"
              className="border-error"
              onPress={handleLeave}
              disabled={leaveGuild.isPending}
            >
              <LogOut size={18} color="#c64545" />
              <Text className="font-body-medium text-button text-error">
                Leave Guild
              </Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  )
}
