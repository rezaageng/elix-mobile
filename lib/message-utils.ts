import type { GuildMessage } from "@/lib/api/schemas"
import type { PendingMessage } from "@/components/guild/pending-message-bubble"

export type ListItem =
  | { type: "message"; data: GuildMessage }
  | { type: "pending"; data: PendingMessage }
  | { type: "separator"; date: Date }

export function formatDayLabel(date: Date): string {
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return "Today"

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function buildListItems(
  messages: GuildMessage[],
  pendingMessages: PendingMessage[]
): ListItem[] {
  const items: ListItem[] = []
  let lastDateKey: string | undefined

  for (const message of messages) {
    const date = new Date(message.createdAt)
    const dateKey = date.toDateString()
    if (dateKey !== lastDateKey) {
      items.push({ type: "separator", date })
      lastDateKey = dateKey
    }
    items.push({ type: "message", data: message })
  }

  for (const pending of pendingMessages) {
    const date = new Date(pending.createdAt)
    const dateKey = date.toDateString()
    if (dateKey !== lastDateKey) {
      items.push({ type: "separator", date })
      lastDateKey = dateKey
    }
    items.push({ type: "pending", data: pending })
  }

  return items
}
