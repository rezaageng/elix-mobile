import * as Notifications from "expo-notifications"

import type { ClassQuest } from "@/lib/api/schemas"

// ponytail: global cancellation by prefix — if per-quest granularity is needed, track IDs in a Map
const QUEST_PREFIX = "quest-"
const STREAK_ID = "streak-reminder"

function questId(questId: string, kind: "starting" | "ending") {
  return `${QUEST_PREFIX}${questId}-${kind}`
}

function isQuestNotification(id: string) {
  return id.startsWith(QUEST_PREFIX)
}

// ── Quest notifications ──

/**
 * Cancel all previously scheduled quest notifications and schedule fresh ones
 * based on the current quest list and notification preference toggles.
 */
export async function scheduleQuestNotifications(
  quests: ClassQuest[],
  timeZone: string,
  preferences?: { starting: boolean; endingSoon: boolean }
) {
  // Cancel existing quest notifications
  await cancelQuestNotifications()

  const prefStarting = preferences?.starting ?? true
  const prefEndingSoon = preferences?.endingSoon ?? true

  for (const quest of quests) {
    // Only schedule for quests not yet completed
    const status = quest.progress?.[0]?.status
    if (status === "completed") continue

    const startsAt = quest.startsAt
    if (!startsAt) continue

    const startDate = new Date(startsAt)
    const now = new Date()

    // QUEST_STARTING — at quest.startsAt, if in future
    if (prefStarting && startDate > now) {
      await Notifications.scheduleNotificationAsync({
        identifier: questId(quest.id, "starting"),
        content: {
          title: "Quest Starting!",
          body: `"${quest.name}" is starting now.`,
          data: { url: `/quest/${quest.id}` },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: startDate },
      })
    }

    // QUEST_ENDING_SOON — 1 hour before end (startsAt + duration days - 1h)
    if (prefEndingSoon) {
      const endDate = new Date(startDate.getTime() + quest.duration * 24 * 60 * 60 * 1000)
      const warnDate = new Date(endDate.getTime() - 60 * 60 * 1000)
      if (warnDate > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: questId(quest.id, "ending"),
          content: {
            title: "Quest Ending Soon",
            body: `"${quest.name}" ends in less than an hour.`,
            data: { url: `/quest/${quest.id}` },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: warnDate },
        })
      }
    }
  }
}

/**
 * Cancel all scheduled quest notifications.
 */
export async function cancelQuestNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const toCancel = scheduled
    .filter((n) => isQuestNotification(n.identifier))
    .map((n) => n.identifier)

  await Promise.all(toCancel.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
}

// ── Streak reminder ──

/**
 * Schedule a daily streak reminder at 8pm local time.
 */
export async function scheduleStreakReminder(
  timeZone: string,
  enabled = true
) {
  // Always cancel previous first
  await cancelStreakReminder()

  if (!enabled) return

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_ID,
    content: {
      title: "Don't break your streak!",
      body: "Complete a quest today to keep it alive.",
      data: { url: "/(tabs)" },
    },
    // ponytail: DailyTriggerInput uses device local time already; timeZone param available if we need CalendarTriggerInput
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  })
}

/**
 * Cancel the daily streak reminder.
 */
export async function cancelStreakReminder() {
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID)
}
