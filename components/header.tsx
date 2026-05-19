import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"

import { useThemeColor } from "@/lib/use-theme-color"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  canGoBack?: boolean
}

export default function Header({ title, canGoBack = true }: HeaderProps) {
  const router = useRouter()
  const iconColor = useThemeColor("foreground")

  return (
    <View
      className={cn("flex-row items-center", {
        "justify-between": canGoBack,
        "justify-center": !canGoBack,
      })}
    >
      {canGoBack && (
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={20} color={iconColor} />
        </TouchableOpacity>
      )}
      <Text className="font-display text-display-sm text-ink dark:text-on-dark">
        {title}
      </Text>
      {canGoBack && <View className="w-[24px]" />}
    </View>
  )
}
