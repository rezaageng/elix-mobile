import { useRouter } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { TouchableOpacity } from "react-native"
import { useColorScheme } from "react-native"

import { colors } from "@/lib/colors"

function BackButton({ tintColor }: { tintColor: string }) {
  const router = useRouter()
  return (
    <TouchableOpacity onPress={() => router.back()} className="mr-2">
      <ChevronLeft size={28} color={tintColor} />
    </TouchableOpacity>
  )
}

export function useHeaderOptions(title: string) {
  const colorScheme = useColorScheme() ?? "light"
  const theme = colors[colorScheme]

  return {
    title,
    headerShown: true as const,
    headerTitleStyle: {
      fontFamily: "CrimsonPro_400Regular",
      fontSize: 28,
      color: theme.ink,
    },
    headerStyle: { backgroundColor: theme.canvas },
    headerTintColor: theme.foreground,
    headerLeft: () => <BackButton tintColor={theme.foreground} />,
  }
}
