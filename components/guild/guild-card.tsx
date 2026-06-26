import { Image } from "expo-image"
import { Users } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

import type { Guild } from "@/lib/api/schemas"
import { useThemeColor } from "@/lib/use-theme-color"

interface GuildCardProps {
  guild: Guild
  onPress: (guild: Guild) => void
  testID?: string
}

export default function GuildCard({ guild, onPress, testID }: GuildCardProps) {
  const mutedSoftColor = useThemeColor("muted-soft")

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex-row items-start gap-sm rounded-lg bg-surface-card p-md dark:bg-surface-dark-elevated"
      onPress={() => onPress(guild)}
      testID={testID}
    >
      {guild.imageUrl ? (
        <Image
          source={{ uri: guild.imageUrl }}
          style={{ width: 48, height: 48, borderRadius: 8 }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${guild.name} guild image`}
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-md bg-primary/20">
          <Users size={20} color="#cc785c" />
        </View>
      )}
      <View className="flex-1 gap-xs">
        <Text
          className="font-body-medium text-title-sm text-ink dark:text-on-dark"
          numberOfLines={1}
        >
          {guild.name}
        </Text>
        {guild.description && (
          <Text
            className="font-body text-body-sm text-muted dark:text-on-dark-soft"
            numberOfLines={2}
          >
            {guild.description}
          </Text>
        )}
        <View className="flex-row items-center gap-1">
          <Users size={12} color={mutedSoftColor} />
          <Text className="font-body text-caption text-muted-soft">Guild</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
