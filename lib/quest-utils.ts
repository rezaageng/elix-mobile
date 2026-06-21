import type { ClassQuest } from "@/lib/api/schemas"

export function getEffectiveQuestValues(quest: ClassQuest) {
  const override = quest.overrides?.at(-1)
  return {
    name: override?.name ?? quest.name,
    description: override?.description ?? quest.description,
    duration: override?.duration ?? quest.duration,
    startsAt: override?.startsAt ?? quest.startsAt,
  }
}

export function getQuestStatus(quest: ClassQuest): string {
  return quest.progress?.[0]?.status ?? "not_started"
}

export function getQuestStatusLabel(quest: ClassQuest): string {
  const status = getQuestStatus(quest)
  if (status === "completed") return "Completed"
  if (status === "in_progress") return "In Progress"
  const effective = getEffectiveQuestValues(quest)
  if (status === "not_started" && effective.startsAt) {
    return new Date(effective.startsAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  return "Not Started"
}

export function isActive(quest: ClassQuest): boolean {
  return getQuestStatus(quest) !== "completed"
}

export function sortQuests(quests: ClassQuest[]): ClassQuest[] {
  // eslint-disable-next-line unicorn/no-array-sort
  return [...quests].sort((a, b) => {
    const aActive = isActive(a)
    const bActive = isActive(b)
    if (aActive && !bActive) return -1
    if (!aActive && bActive) return 1

    const aCompletedAt = a.progress?.[0]?.completedAt
    const bCompletedAt = b.progress?.[0]?.completedAt
    if (aCompletedAt && bCompletedAt) {
      return new Date(bCompletedAt).getTime() - new Date(aCompletedAt).getTime()
    }
    if (aCompletedAt) return -1
    if (bCompletedAt) return 1
    return 0
  })
}

export function formatHours(hours: number): string {
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (days > 0 && remainingHours > 0) return `${days}d ${remainingHours}h`
  if (days > 0) return `${days}d`
  return `${hours}h`
}

export function getEffectiveStartedAt(quest: ClassQuest): Date | undefined {
  const progress = quest.progress?.[0]
  if (progress?.startedAt) return new Date(progress.startedAt)

  // Auto-started: no prerequisite or prerequisite completed
  if (!quest.requiredQuestId) {
    return new Date(quest.createdAt)
  }

  return undefined
}

export function getDurationInfo(
  quest: ClassQuest
): { text: string; isOverdue: boolean } | undefined {
  const status = getQuestStatus(quest)
  if (status === "completed") return undefined
  if (status === "not_started") {
    return { text: formatHours(quest.duration), isOverdue: false }
  }

  const startedAt = getEffectiveStartedAt(quest)
  if (!startedAt) {
    return { text: formatHours(quest.duration), isOverdue: false }
  }

  const deadline = startedAt.getTime() + quest.duration * 60 * 60 * 1000
  const now = Date.now()
  const diffMs = deadline - now

  if (diffMs < 0) {
    const overdueHours = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60))
    return { text: `Overdue ${formatHours(overdueHours)}`, isOverdue: true }
  }

  const remainingHours = Math.ceil(diffMs / (1000 * 60 * 60))
  return { text: `${formatHours(remainingHours)} left`, isOverdue: false }
}

export function hasCompletedQuestToday(quests: ClassQuest[]): boolean {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

  for (const quest of quests) {
    const completedAt = quest.progress?.[0]?.completedAt
    if (completedAt) {
      const completedDate = new Date(completedAt)
      if (completedDate >= startOfToday && completedDate < endOfToday) {
        return true
      }
    }
  }
  return false
}
