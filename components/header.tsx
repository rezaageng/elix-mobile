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
  titleAlign?: "left" | "center"
}

export default function Header({
  title,
  canGoBack = true,
  right,
  titleAlign = "center",
}: HeaderProps) {
  const router = useRouter()
  const iconColor = useThemeColor("foreground")
  const isCentered = titleAlign === "center"
  const showSpacer = !isCentered && right

  let leftElement: ReactNode
  if (canGoBack) {
    leftElement = (
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeft size={20} color={iconColor} />
      </TouchableOpacity>
    )
  } else if (isCentered) {
    leftElement = <View className="w-[24px]" />
  }

  const rightElement = isCentered ? (right ?? <View className="w-[24px]" />) : right

  return (
    <View
      className={cn("flex-row items-center px-4 py-2", {
        "justify-between": isCentered && (canGoBack || right),
        "justify-center": isCentered && !canGoBack && !right,
      })}
    >
      {leftElement}
      <Text className="font-display text-display-sm text-ink dark:text-on-dark">
        {title}
      </Text>
      {showSpacer && <View className="flex-1" />}
      {rightElement}
    </View>
  )
}
