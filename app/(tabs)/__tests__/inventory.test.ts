import { getItemUseAction } from "@/lib/app-logic"

const defaultEntry = {
  itemId: "item-1" as const,
  quantity: 1,
  item: { type: "xp_boost" },
}

describe("getItemUseAction", () => {
  describe("restore_streak", () => {
    it("returns block when user has no restorableStreak", () => {
      const entry = { ...defaultEntry, item: { type: "restore_streak" } }
      const result = getItemUseAction(entry, { restorableStreak: 0 })
      expect(result).toMatchObject({ flow: "block" })
    })

    it("returns block when restorableStreak is falsy", () => {
      const entry = { ...defaultEntry, item: { type: "restore_streak" } }
      expect(getItemUseAction(entry, {})).toMatchObject({ flow: "block" })
      expect(getItemUseAction(entry)).toMatchObject({ flow: "block" })
    })

    it("returns confirm_restore_streak when user has restorableStreak", () => {
      const entry = { ...defaultEntry, item: { type: "restore_streak" } }
      const result = getItemUseAction(entry, {
        restorableStreak: 5,
        streak: 10,
      })
      expect(result).toMatchObject({
        flow: "confirm_restore_streak",
        restorableStreak: 5,
        currentStreak: 10,
        itemId: "item-1",
      })
    })

    it("defaults currentStreak to 0 when streak is undefined", () => {
      const entry = { ...defaultEntry, item: { type: "restore_streak" } }
      const result = getItemUseAction(entry, { restorableStreak: 3 })
      expect(result).toMatchObject({
        flow: "confirm_restore_streak",
        currentStreak: 0,
      })
    })
  })

  describe("deadline_extension", () => {
    const makeQuest = (id: string, name: string, status?: string) => ({
      id,
      name,
      progress: status ? [{ status }] : undefined,
    })

    it("returns block when no quests are in progress", () => {
      const entry = { ...defaultEntry, item: { type: "deadline_extension" } }
      expect(getItemUseAction(entry, {}, [])).toMatchObject({ flow: "block" })
    })

    it("returns block when quests is undefined", () => {
      const entry = { ...defaultEntry, item: { type: "deadline_extension" } }
      expect(getItemUseAction(entry, {})).toMatchObject({ flow: "block" })
    })

    it("ignores quests with no progress entry", () => {
      const entry = { ...defaultEntry, item: { type: "deadline_extension" } }
      expect(
        getItemUseAction(entry, {}, [makeQuest("q1", "Quest 1")])
      ).toMatchObject({ flow: "block" })
    })

    it("ignores quests that are not in_progress", () => {
      const entry = { ...defaultEntry, item: { type: "deadline_extension" } }
      expect(
        getItemUseAction(entry, {}, [makeQuest("q1", "Quest 1", "completed")])
      ).toMatchObject({ flow: "block" })
    })

    it("returns confirm_deadline_extension with in-progress quests", () => {
      const entry = { ...defaultEntry, item: { type: "deadline_extension" } }
      const quests = [
        makeQuest("q1", "Active Quest", "in_progress"),
        makeQuest("q2", "Done Quest", "completed"),
      ]
      const result = getItemUseAction(entry, {}, quests)
      expect(result).toMatchObject({
        flow: "confirm_deadline_extension",
        itemId: "item-1",
        quests: [{ id: "q1", name: "Active Quest" }],
      })
    })
  })

  describe("default item (xp_boost, gold_boost, etc.)", () => {
    it("returns use_directly for xp_boost", () => {
      const entry = { ...defaultEntry, item: { type: "xp_boost" } }
      const result = getItemUseAction(entry, {}, [])
      expect(result).toMatchObject({ flow: "use_directly", itemId: "item-1" })
      if (result.flow === "use_directly") {
        expect(result.body).toEqual({ quantity: 1 })
      }
    })

    it("returns use_directly for gold_boost", () => {
      const entry = { ...defaultEntry, item: { type: "gold_boost" } }
      expect(getItemUseAction(entry, {}, [])).toMatchObject({ flow: "use_directly" })
    })

    it("returns use_directly for unknown type", () => {
      const entry = { ...defaultEntry, item: { type: "unknown_type" } }
      expect(getItemUseAction(entry, {}, [])).toMatchObject({ flow: "use_directly" })
    })
  })

  describe("guard: quantity < 1", () => {
    it("returns block when quantity is 0", () => {
      const entry = { ...defaultEntry, quantity: 0 }
      expect(getItemUseAction(entry, {}, [])).toMatchObject({ flow: "block" })
    })

    it("returns block when quantity is negative", () => {
      const entry = { ...defaultEntry, quantity: -1 }
      expect(getItemUseAction(entry, {}, [])).toMatchObject({ flow: "block" })
    })
  })
})
