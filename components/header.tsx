import { useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import type { ReactNode } from "react"
import { Text, TouchableOpacity, View } from "react-native"

import { useThemeColor } from "@/lib/use-theme-color"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  canGoBack?: boolean
  right?: ReactNode
}

export default function Header({ title, canGoBack = true, right }: HeaderProps) {
  const router = useRouter()
  const iconColor = useThemeColor("foreground")

  return (
    <View
      className={cn("flex-row items-center px-4 py-2", {
        "justify-between": canGoBack || right,
        "justify-center": !canGoBack && !right,
      })}
    >
      {canGoBack ? (
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={20} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View className="w-[24px]" />
      )}
      <Text className="font-display text-display-sm text-ink dark:text-on-dark">
        {title}
      </Text>
      {right ?? <View className="w-[24px]" />}
    </View>
  )
}
