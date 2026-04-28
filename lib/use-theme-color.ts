import { useColorScheme } from "react-native"

import { colors, type ThemeColorKey } from "@/lib/colors"

/**
 * Returns the resolved color value for the current color scheme.
 * Useful for native components that don't support NativeWind classes.
 *
 * @example
 * const iconColor = useThemeColor("primary")
 * <AntDesign color={iconColor} />
 */
export function useThemeColor(colorKey: ThemeColorKey): string {
  const colorScheme = useColorScheme() ?? "light"
  return colors[colorScheme][colorKey]
}
