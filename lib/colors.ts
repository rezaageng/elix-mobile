/**
 * Theme color definitions for use outside of NativeWind (e.g. icons, StatusBar, native components).
 * These mirror the CSS variables defined in global.css.
 */

export const colors = {
  light: {
    primary: "#b96647",
    primaryForeground: "#ffffff",
    background: "#ffffff",
    surface: "#f5f5f5",
    surfaceRaised: "#fafafa",
    foreground: "#171717",
    foregroundSecondary: "#737373",
    foregroundMuted: "#a3a3a3",
    border: "#e5e5e5",
    borderStrong: "#d4d4d4",
    destructive: "#dc2626",
    success: "#16a34a",
    warning: "#eab308",
    card: "#ffffff",
    cardForeground: "#171717",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    input: "#e5e5e5",
    ring: "#b96647",
  },
  dark: {
    primary: "#c57659",
    primaryForeground: "#ffffff",
    background: "#0a0a0a",
    surface: "#171717",
    surfaceRaised: "#262626",
    foreground: "#f5f5f5",
    foregroundSecondary: "#a3a3a3",
    foregroundMuted: "#737373",
    border: "#262626",
    borderStrong: "#404040",
    destructive: "#ef4444",
    success: "#22c55e",
    warning: "#facc15",
    card: "#171717",
    cardForeground: "#f5f5f5",
    muted: "#262626",
    mutedForeground: "#a3a3a3",
    input: "#262626",
    ring: "#c57659",
  },
} as const

export type ThemeColors = typeof colors.light
export type ThemeColorKey = keyof ThemeColors
