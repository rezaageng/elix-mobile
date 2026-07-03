import { Image } from "expo-image"
import { MoreVertical } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

import type { GuildMember } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"

interface MemberRowProps {
  member: GuildMember
  guildId: string
  canManage: boolean
  isCurrentUser: boolean
  onPress?: () => void
  onActionSheet: (member: GuildMember) => void
  testID?: string
}

function RoleBadge({ role }: { role: string }) {
  if (role === "owner") {
    return (
      <View className="rounded-full bg-primary px-2 py-0.5">
        <Text className="font-body-bold text-caption text-primary-foreground">
          Owner
        </Text>
      </View>
    )
  }
  if (role === "admin") {
    return (
      <View className="rounded-full bg-accent-teal px-2 py-0.5">
        <Text className="text-on-primary font-body-bold text-caption">
          Admin
        </Text>
      </View>
    )
  }
  return (
    <View className="rounded-full bg-surface-cream-strong px-2 py-0.5 dark:bg-surface-dark-soft">
      <Text className="font-body-medium text-caption text-muted dark:text-on-dark-soft">
        Member
      </Text>
    </View>
  )
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?"
}

export default function MemberRow({
  member,
  guildId,
  canManage,
  isCurrentUser,
  onPress,
  onActionSheet,
  testID,
}: MemberRowProps) {
  const mutedColor = useThemeColor("muted")

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-sm rounded-lg bg-surface-card p-md dark:bg-surface-dark-elevated"
      testID={testID}
    >
      {member.image ? (
        <Image
          source={{ uri: member.image }}
          style={{ width: 40, height: 40, borderRadius: 9999 }}
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
      <View className="flex-1 gap-xs">
        <Text className="font-body-medium text-body-sm text-ink dark:text-on-dark">
          {member.name}
        </Text>
      </View>
      <RoleBadge role={member.role} />
      {canManage && !isCurrentUser && member.role !== "owner" && (
        <TouchableOpacity
          onPress={() => onActionSheet(member)}
          activeOpacity={0.7}
          className="rounded-full p-1.5 active:bg-surface-soft"
          accessibilityLabel="Member actions"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="MemberActionsButton"
        >
          <MoreVertical size={18} color={mutedColor} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
}
