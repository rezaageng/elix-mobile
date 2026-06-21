import { useEffect } from "react"
import * as Notifications from "expo-notifications"

import { registerPushTokenIfNeeded } from "@/lib/notifications/register"

// Set notification handler once — show banner, play sound, update badge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export function useNotificationSetup(sessionUserId?: string) {
  // Register push token when session is available
  useEffect(() => {
    if (!sessionUserId) return

    registerPushTokenIfNeeded(sessionUserId).catch(() => {
      // Silently fail — push registration is non-critical
    })
  }, [sessionUserId])
}
