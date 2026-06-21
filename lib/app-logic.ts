// ── Pure functions extracted from components for testability ──

/**
 * Pure function: decides the initial route based on auth state and current segment.
 * Returns a path to redirect to, or null to stay.
 * (Extracted from app/_layout.tsx)
 */
export function getInitialRoute(
  session: { user: { activeClassId?: string | null } } | null | undefined,
  isPending: boolean,
  segments: string[]
): string | null {
  // eslint-disable-next-line unicorn/no-null -- loading state
  if (isPending) return null

  const inAuthGroup = segments[0] === "login"
  const inRolesGroup = segments[0] === "roles"

  if (!session && !inAuthGroup) return "/login"
  // eslint-disable-next-line unicorn/no-null -- already on login
  if (!session) return null

  const needsClass = !session.user.activeClassId

  if (inAuthGroup) return needsClass ? "/roles" : "/(tabs)"
  if (needsClass && !inRolesGroup) return "/roles"

  // eslint-disable-next-line unicorn/no-null -- stay on current route
  return null
}

// ── Item use decision (extracted from app/(tabs)/inventory.tsx) ──

export type ItemUseAction =
  | { flow: "block"; reason: string }
  | {
      flow: "confirm_restore_streak"
      restorableStreak: number
      currentStreak: number
      itemId: string
    }
  | {
      flow: "confirm_deadline_extension"
      quests: { id: string; name: string }[]
      itemId: string
    }
  | { flow: "use_directly"; itemId: string; body: { quantity: number; targetQuestId?: string } }

export function getItemUseAction(
  entry: { itemId: string; quantity: number; item: { type: string } },
  user?: { restorableStreak?: number; streak?: number } | null,
  quests?: ({ id: string; name: string; progress?: { status: string }[] } | null)[] | null
): ItemUseAction {
  if (entry.quantity < 1) return { flow: "block", reason: "No items left" }

  if (entry.item.type === "restore_streak") {
    if (!user?.restorableStreak) {
      return {
        flow: "block",
        reason: "You don't have a broken streak available to restore.",
      }
    }
    return {
      flow: "confirm_restore_streak",
      restorableStreak: user.restorableStreak,
      currentStreak: user.streak ?? 0,
      itemId: entry.itemId,
    }
  }

  if (entry.item.type === "deadline_extension") {
    const inProgress =
      (quests?.filter(
        (q): q is { id: string; name: string } =>
          // eslint-disable-next-line unicorn/no-null -- nullable array items
          q != null && q.progress?.[0]?.status === "in_progress"
      ) as { id: string; name: string }[]) ?? []

    if (inProgress.length === 0) {
      return { flow: "block", reason: "You don't have any quests in progress to extend the deadline for." }
    }

    return {
      flow: "confirm_deadline_extension",
      quests: inProgress,
      itemId: entry.itemId,
    }
  }

  return { flow: "use_directly", itemId: entry.itemId, body: { quantity: 1 } }
}

// ── Member actions (extracted from components/guild/members-tab.tsx) ──

export interface MemberAction {
  label: string
  style?: "destructive" | "cancel"
  kind?: "promote" | "demote" | "kick" | "cancel"
}

export function getMemberActions(
  member: { id: string; role: string; name: string },
  currentUserRole: string | undefined,
  currentUserId: string | undefined
): MemberAction[] {
  const options: MemberAction[] = []
  const isOwner = currentUserRole === "owner"
  const isAdmin = currentUserRole === "admin" || currentUserRole === "owner"
  const isTargetOwner = member.role === "owner"
  const isSelf = member.id === currentUserId

  if (isOwner && !isTargetOwner) {
    options.push(
      member.role === "admin"
        ? { label: "Demote to Member", kind: "demote" }
        : { label: "Promote to Admin", kind: "promote" }
    )
  }

  if (isAdmin && !isSelf && !isTargetOwner) {
    options.push({ label: "Kick", style: "destructive", kind: "kick" })
  }

  options.push({ label: "Cancel", style: "cancel", kind: "cancel" })
  return options
}

// ── Profile diff (extracted from components/profile/profile-screen.tsx) ──

export function getProfileDiff(
  current: { name: string; username: string | null },
  next: { name: string; username: string }
): { name?: string; username?: string } {
  const body: { name?: string; username?: string } = {}
  if (next.name !== current.name) body.name = next.name
  const normalizedCurrentUsername = current.username ?? ""
  if (next.username !== normalizedCurrentUsername) {
    body.username = next.username || undefined
  }
  return body
}

// ── Image upload info (extracted from components/profile/profile-screen.tsx) ──

export function getImageUploadInfo(uri: string): {
  filename: string
  mimeType: string
} {
  const filename = uri.split("/").pop() ?? "photo.jpg"
  const match = /\.\w+$/.exec(filename)
  const mimeType = match ? `image/${match[0].slice(1)}` : "image/jpeg"
  return { filename, mimeType }
}

// ── XP percent (extracted from components/profile/avatar-section.tsx) ──

export function getXpPercent(xp: number): number {
  return Math.min(100, Math.round((xp / 1000) * 100))
}

// ── Guild role helpers (extracted from components/guild/guild-home.tsx) ──

export function getCurrentUserRoleInGuild(
  currentUserMember: { role: string } | undefined,
  guild: { role: string }
): string {
  return currentUserMember?.role ?? guild.role
}

export function canManageGuild(role: string): boolean {
  return role === "admin" || role === "owner"
}

export function canLeaveGuild(role: string): boolean {
  return role !== "owner"
}

// ── Quest names toggle (extracted from components/profile/settings-sheet.tsx) ──

export function getShowQuestNamesInActivity(
  settings?: { showQuestNamesInActivity?: boolean }
): boolean {
  return settings?.showQuestNamesInActivity ?? true
}

export function toggleShowQuestNamesInActivity(current: boolean): boolean {
  return !current
}

export function getQuestNamesToggleValue(
  settings?: { showQuestNamesInActivity?: boolean }
): boolean {
  return !getShowQuestNamesInActivity(settings)
}

// ── Debounce (extracted from components/guild/discovery-screen.tsx) ──

export function createDebounce(
  delayMs: number = 300
): {
  call: (text: string, callback: (text: string) => void) => void
  cancel: () => void
} {
  let timer: ReturnType<typeof setTimeout> | null = null
  return {
    call: (text, callback) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        callback(text)
        timer = null
      }, delayMs)
    },
    cancel: () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
  }
}
