import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import * as SecureStore from "expo-secure-store"

import { registerPushToken } from "@/lib/api/notifications"

const TOKEN_KEY = "push_token"
const TOKEN_USER_KEY = "push_token_user_id"

async function getProjectId(): Promise<string | undefined> {
  try {
    const Constants = await import("expo-constants")
    return Constants.default.expoConfig?.extra?.eas?.projectId ?? undefined
  } catch {
    return undefined
  }
}

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    // ponytail: simulator returns undefined, push tokens don't work on sims
    return undefined
  }

  // Android channel
  if (Device.osName === "Android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#cc785c",
    })
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
      android: {},
    })
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    return undefined
  }

  const projectId = await getProjectId()
  if (!projectId) return undefined

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  })

  return tokenData.data
}

export async function registerPushTokenIfNeeded(
  sessionUserId?: string
): Promise<void> {
  if (!sessionUserId) return

  const token = await registerForPushNotificationsAsync()
  if (!token) return

  const storedToken = await SecureStore.getItemAsync(TOKEN_KEY)
  const storedUserId = await SecureStore.getItemAsync(TOKEN_USER_KEY)

  // Skip only if the same token is already registered for the same user.
  // If the user changed (same device, different account), re-register so the
  // backend upsert associates the token with the new user.
  if (storedToken === token && storedUserId === sessionUserId) {
    return
  }

  try {
    await registerPushToken(token, "expo")
    await SecureStore.setItemAsync(TOKEN_KEY, token)
    await SecureStore.setItemAsync(TOKEN_USER_KEY, sessionUserId)
  } catch {
    // Silently fail — push registration is non-critical
  }
}
