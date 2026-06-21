import {
  canLeaveGuild,
  canManageGuild,
  createDebounce,
  getCurrentUserRoleInGuild,
  getQuestNamesToggleValue,
  getShowQuestNamesInActivity,
  toggleShowQuestNamesInActivity,
} from "@/lib/app-logic"

// ── Guild role helpers ──

describe("getCurrentUserRoleInGuild", () => {
  it("returns member role when currentUserMember is undefined", () => {
    const guild = { role: "member" }
    expect(getCurrentUserRoleInGuild(undefined, guild)).toBe("member")
  })

  it("returns guild role when currentUserMember is undefined (non-member)", () => {
    const guild = { role: "admin" }
    expect(getCurrentUserRoleInGuild(undefined, guild)).toBe("admin")
  })

  it("returns member role from membership when present", () => {
    const member = { role: "admin" }
    const guild = { role: "member" }
    expect(getCurrentUserRoleInGuild(member, guild)).toBe("admin")
  })

  it("prefers membership role over guild role", () => {
    const member = { role: "owner" }
    const guild = { role: "member" }
    expect(getCurrentUserRoleInGuild(member, guild)).toBe("owner")
  })
})

describe("canManageGuild", () => {
  it("returns true for admin", () => {
    expect(canManageGuild("admin")).toBe(true)
  })

  it("returns true for owner", () => {
    expect(canManageGuild("owner")).toBe(true)
  })

  it("returns false for member", () => {
    expect(canManageGuild("member")).toBe(false)
  })

  it("returns false for unknown roles", () => {
    expect(canManageGuild("moderator")).toBe(false)
  })
})

describe("canLeaveGuild", () => {
  it("returns false for owner (cannot leave own guild)", () => {
    expect(canLeaveGuild("owner")).toBe(false)
  })

  it("returns true for admin", () => {
    expect(canLeaveGuild("admin")).toBe(true)
  })

  it("returns true for member", () => {
    expect(canLeaveGuild("member")).toBe(true)
  })
})

// ── Quest names notification toggle ──

describe("getShowQuestNamesInActivity", () => {
  it("defaults to true when settings are undefined", () => {
    expect(getShowQuestNamesInActivity()).toBe(true)
  })

  it("returns false when setting is false", () => {
    expect(
      getShowQuestNamesInActivity({ showQuestNamesInActivity: false })
    ).toBe(false)
  })

  it("returns true when setting is true", () => {
    expect(
      getShowQuestNamesInActivity({ showQuestNamesInActivity: true })
    ).toBe(true)
  })

  it("returns true when setting is missing", () => {
    expect(getShowQuestNamesInActivity({})).toBe(true)
  })
})

describe("toggleShowQuestNamesInActivity", () => {
  it("returns false when given true (toggle off)", () => {
    expect(toggleShowQuestNamesInActivity(true)).toBe(false)
  })

  it("returns true when given false (toggle on)", () => {
    expect(toggleShowQuestNamesInActivity(false)).toBe(true)
  })
})

describe("getQuestNamesToggleValue", () => {
  it("returns false (UI toggle off) when setting is default true", () => {
    expect(getQuestNamesToggleValue()).toBe(false)
  })

  it("returns true (UI toggle on) when setting is false", () => {
    expect(
      getQuestNamesToggleValue({ showQuestNamesInActivity: false })
    ).toBe(true)
  })

  it("returns false (UI toggle off) when setting is true", () => {
    expect(
      getQuestNamesToggleValue({ showQuestNamesInActivity: true })
    ).toBe(false)
  })
})

// ── Debounce ──

describe("createDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("calls callback after the delay", () => {
    const spy = jest.fn()
    const deb = createDebounce(300)

    deb.call("hello", spy)
    expect(spy).not.toHaveBeenCalled()

    jest.advanceTimersByTime(300)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith("hello")
  })

  it("resets delay on rapid calls (only last one fires)", () => {
    const spy = jest.fn()
    const deb = createDebounce(300)

    deb.call("h", spy)
    deb.call("he", spy)
    deb.call("hel", spy)
    deb.call("hell", spy)
    deb.call("hello", spy)

    jest.advanceTimersByTime(100)
    expect(spy).not.toHaveBeenCalled()

    jest.advanceTimersByTime(200)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith("hello")
  })

  it("does not call callback after cancel", () => {
    const spy = jest.fn()
    const deb = createDebounce(300)

    deb.call("hello", spy)
    deb.cancel()

    jest.advanceTimersByTime(300)
    expect(spy).not.toHaveBeenCalled()
  })

  it("handles multiple independent call sequences", () => {
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const deb = createDebounce(200)

    deb.call("first", spy1)
    jest.advanceTimersByTime(150)
    deb.call("second", spy2)

    // First should be cancelled by second call
    jest.advanceTimersByTime(200)
    expect(spy1).not.toHaveBeenCalled()
    expect(spy2).toHaveBeenCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith("second")
  })
})
