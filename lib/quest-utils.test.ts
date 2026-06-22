import type { ClassQuest } from "@/lib/api/schemas"
import {
  getDurationInfo,
  getEffectiveQuestValues,
  getEffectiveStartedAt,
  getQuestStatus,
  getQuestStatusLabel,
  getQuestSubmitBody,
  hasCompletedQuestToday,
  isActive,
  sortQuests,
} from "@/lib/quest-utils"

function makeQuest(overrides: Partial<ClassQuest> = {}): ClassQuest {
  return {
    id: "q-1",
    classId: "c-1",
    name: "Test Quest",
    description: "A test quest",
    type: "main",
    submissionType: "text",
    duration: 24,
    // eslint-disable-next-line unicorn/no-null
    requiredQuestId: null,
    authorId: "u-1",
    startsAt: undefined,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    xpReward: 100,
    goldReward: 50,
    progress: undefined,
    overrides: undefined,
    ...overrides,
  }
}

// ── getEffectiveQuestValues ──

describe("getEffectiveQuestValues", () => {
  it("returns quest values when no overrides exist", () => {
    const quest = makeQuest()
    expect(getEffectiveQuestValues(quest)).toEqual({
      name: "Test Quest",
      description: "A test quest",
      duration: 24,
      startsAt: undefined,
    })
  })

  it("returns override values when overrides exist", () => {
    const quest = makeQuest({
      overrides: [
        {
          id: "o-1",
          userId: "u-1",
          questId: "q-1",
          name: "Overridden Name",
          duration: 48,
          startsAt: "2025-06-01T00:00:00.000Z",
          createdAt: "2025-01-02T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
      ],
    })
    expect(getEffectiveQuestValues(quest)).toEqual({
      name: "Overridden Name",
      description: "A test quest",
      duration: 48,
      startsAt: "2025-06-01T00:00:00.000Z",
    })
  })

  it("uses the last override in the array", () => {
    const quest = makeQuest({
      overrides: [
        {
          id: "o-1",
          userId: "u-1",
          questId: "q-1",
          name: "First Override",
          createdAt: "2025-01-02T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
        {
          id: "o-2",
          userId: "u-1",
          questId: "q-1",
          name: "Second Override",
          duration: 72,
          createdAt: "2025-01-03T00:00:00.000Z",
          updatedAt: "2025-01-03T00:00:00.000Z",
        },
      ],
    })
    const values = getEffectiveQuestValues(quest)
    expect(values.name).toBe("Second Override")
    expect(values.duration).toBe(72)
  })

  it("falls back to quest values when override fields are null", () => {
    const quest = makeQuest({
      overrides: [
        {
          id: "o-1",
          userId: "u-1",
          questId: "q-1",
          name: undefined,
          description: undefined,
          duration: undefined,
          startsAt: undefined,
          createdAt: "2025-01-02T00:00:00.000Z",
          updatedAt: "2025-01-02T00:00:00.000Z",
        },
      ],
    })
    expect(getEffectiveQuestValues(quest)).toEqual({
      name: "Test Quest",
      description: "A test quest",
      duration: 24,
      startsAt: undefined,
    })
  })
})

// ── getQuestStatus ──

describe("getQuestStatus", () => {
  it("returns not_started when no progress", () => {
    expect(getQuestStatus(makeQuest())).toBe("not_started")
  })

  it("returns in_progress when progress has in_progress status", () => {
    const quest = makeQuest({
      progress: [{ id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" }],
    })
    expect(getQuestStatus(quest)).toBe("in_progress")
  })

  it("returns completed when progress has completed status", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-01-02T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
      ],
    })
    expect(getQuestStatus(quest)).toBe("completed")
  })
})

// ── getQuestStatusLabel ──

describe("getQuestStatusLabel", () => {
  it("returns Completed for completed quests", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-01-02T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
      ],
    })
    expect(getQuestStatusLabel(quest)).toBe("Completed")
  })

  it("returns In Progress for in_progress quests", () => {
    const quest = makeQuest({
      progress: [{ id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" }],
    })
    expect(getQuestStatusLabel(quest)).toBe("In Progress")
  })

  it("returns Not Started for not_started without startsAt", () => {
    const quest = makeQuest({ startsAt: undefined })
    expect(getQuestStatusLabel(quest)).toBe("Not Started")
  })

  it("returns formatted date for not_started with startsAt", () => {
    const quest = makeQuest({ startsAt: "2025-06-15T14:30:00.000Z" })
    const label = getQuestStatusLabel(quest)
    expect(label).not.toBe("Not Started")
    expect(label).not.toBe("Completed")
    expect(label).not.toBe("In Progress")
    // Should contain June date info
    expect(label).toMatch(/Jun|June|15|14/)
  })
})

// ── isActive ──

describe("isActive", () => {
  it("returns false for completed quest", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-01-02T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
      ],
    })
    expect(isActive(quest)).toBe(false)
  })

  it("returns true for in_progress quest", () => {
    const quest = makeQuest({
      progress: [{ id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" }],
    })
    expect(isActive(quest)).toBe(true)
  })

  it("returns true for not_started quest", () => {
    expect(isActive(makeQuest())).toBe(true)
  })
})

// ── sortQuests ──

describe("sortQuests", () => {
  it("places active quests before completed quests", () => {
    const completed = makeQuest({
      id: "q-completed",
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-completed", status: "completed", completedAt: "2025-01-02T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
      ],
    })
    const active = makeQuest({ id: "q-active" })
    const sorted = sortQuests([completed, active])
    expect(sorted[0]!.id).toBe("q-active")
    expect(sorted[1]!.id).toBe("q-completed")
  })

  it("sorts completed quests by completedAt descending", () => {
    const older = makeQuest({
      id: "q-older",
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-older", status: "completed", completedAt: "2025-01-01T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
      ],
    })
    const newer = makeQuest({
      id: "q-newer",
      progress: [
        { id: "p-2", userId: "u-1", questId: "q-newer", status: "completed", completedAt: "2025-01-05T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-05T00:00:00.000Z" },
      ],
    })
    const sorted = sortQuests([older, newer])
    expect(sorted[0]!.id).toBe("q-newer")
    expect(sorted[1]!.id).toBe("q-older")
  })

  it("does not mutate the original array", () => {
    const q1 = makeQuest({ id: "q-1" })
    const q2 = makeQuest({ id: "q-2" })
    const original = [q1, q2]
    const sorted = sortQuests(original)
    expect(sorted).not.toBe(original)
    expect(original).toHaveLength(2)
  })
})

// ── getEffectiveStartedAt ──

describe("getEffectiveStartedAt", () => {
  it("returns undefined when no progress and has required quest", () => {
    const quest = makeQuest({ requiredQuestId: "prereq-1" })
    expect(getEffectiveStartedAt(quest)).toBeUndefined()
  })

  it("returns createdAt when no progress and no required quest", () => {
    const quest = makeQuest({ requiredQuestId: undefined })
    const result = getEffectiveStartedAt(quest)
    expect(result).toBeInstanceOf(Date)
    expect(result!.toISOString()).toBe("2025-01-01T00:00:00.000Z")
  })

  it("returns progress startedAt when available", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", startedAt: "2025-01-03T12:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-03T12:00:00.000Z" },
      ],
    })
    const result = getEffectiveStartedAt(quest)
    expect(result!.toISOString()).toBe("2025-01-03T12:00:00.000Z")
  })
})

// ── getDurationInfo ──

describe("getDurationInfo", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns undefined for completed quests", () => {
    jest.setSystemTime(new Date("2025-01-10T00:00:00.000Z"))
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-01-02T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" },
      ],
    })
    expect(getDurationInfo(quest)).toBeUndefined()
  })

  it("returns duration text for not_started quests", () => {
    jest.setSystemTime(new Date("2025-01-10T00:00:00.000Z"))
    const quest = makeQuest({ duration: 10 })
    const info = getDurationInfo(quest)
    expect(info).toEqual({ text: "10h", isOverdue: false })
  })

  it("returns plenty of time when quest is far from deadline", () => {
    jest.setSystemTime(new Date("2025-01-02T00:00:00.000Z"))
    const quest = makeQuest({
      duration: 72,
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", startedAt: "2025-01-01T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
      ],
    })
    const info = getDurationInfo(quest)
    expect(info).not.toBeUndefined()
    expect(info!.isOverdue).toBe(false)
    // 72h from Jan 1 00:00 = Jan 4 00:00. At Jan 2 00:00, 48h remaining
    expect(info!.text).toMatch(/left/)
  })

  it("returns ending soon when close to deadline", () => {
    jest.setSystemTime(new Date("2025-01-03T22:00:00.000Z"))
    const quest = makeQuest({
      duration: 72,
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", startedAt: "2025-01-01T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
      ],
    })
    const info = getDurationInfo(quest)
    expect(info).not.toBeUndefined()
    expect(info!.isOverdue).toBe(false)
    expect(info!.text).toMatch(/left/)
  })

  it("returns overdue when past deadline", () => {
    jest.setSystemTime(new Date("2025-01-05T00:00:00.000Z"))
    const quest = makeQuest({
      duration: 24,
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "in_progress", startedAt: "2025-01-01T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" },
      ],
    })
    const info = getDurationInfo(quest)
    expect(info).not.toBeUndefined()
    expect(info!.isOverdue).toBe(true)
    expect(info!.text).toMatch(/Overdue/)
  })
})

// ── hasCompletedQuestToday ──

describe("hasCompletedQuestToday", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2025-06-15T12:00:00.000Z"))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns true when a quest was completed today", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-06-15T08:30:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-06-15T08:30:00.000Z" },
      ],
    })
    expect(hasCompletedQuestToday([quest])).toBe(true)
  })

  it("returns false when completed on a prior day", () => {
    const quest = makeQuest({
      progress: [
        { id: "p-1", userId: "u-1", questId: "q-1", status: "completed", completedAt: "2025-06-13T12:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-06-13T12:00:00.000Z" },
      ],
    })
    expect(hasCompletedQuestToday([quest])).toBe(false)
  })

  it("returns false when no quests are completed", () => {
    const quest = makeQuest()
    expect(hasCompletedQuestToday([quest])).toBe(false)
  })

  it("returns false for empty quest list", () => {
    expect(hasCompletedQuestToday([])).toBe(false)
  })
})

// ── getQuestSubmitBody ──

describe("getQuestSubmitBody", () => {
  const common = {
    name: "My Quest",
    description: "Do the thing",
    duration: 24,
  }

  describe("create mode", () => {
    it("creates a main quest body without requiredQuestId", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: false,
        isQuestAuthor: false,
        type: "main",
        submissionType: "image",
      })
      expect(result.kind).toBe("create")
      expect(result.body).toMatchObject({
        name: "My Quest",
        description: "Do the thing",
        type: "main",
        submissionType: "image",
        duration: 24,
      })
      expect(result.body.requiredQuestId).toBeUndefined()
    })

    it("creates a side quest body with undefined requiredQuestId when empty", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: false,
        isQuestAuthor: false,
        type: "side",
        submissionType: "text",
        requiredQuestId: undefined,
      })
      expect(result.kind).toBe("create")
      expect(result.body.requiredQuestId).toBeUndefined()
    })

    it("creates a side quest body with the prerequisite id when set", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: false,
        isQuestAuthor: false,
        type: "side",
        submissionType: "text",
        requiredQuestId: "prereq-1",
      })
      expect(result.body.requiredQuestId).toBe("prereq-1")
    })

    it("includes startsAt as ISO string when provided", () => {
      const startsAt = new Date("2025-07-01T10:00:00.000Z")
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: false,
        isQuestAuthor: false,
        type: "daily",
        submissionType: "image",
        startsAt,
      })
      expect(result.body.startsAt).toBe("2025-07-01T10:00:00.000Z")
    })

    it("omits startsAt when not provided", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: false,
        isQuestAuthor: false,
        type: "main",
        submissionType: "image",
      })
      expect(result.body.startsAt).toBeUndefined()
    })
  })

  describe("edit own quest (update)", () => {
    it("returns kind 'update' for own quest", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: true,
        type: "main",
      })
      expect(result.kind).toBe("update")
      expect(result.body).toMatchObject({
        name: "My Quest",
        description: "Do the thing",
        duration: 24,
      })
    })

    it("does not include submissionType in update body", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: true,
        type: "main",
        submissionType: "text",
      })
      expect(result.body.submissionType).toBeUndefined()
    })

    it("sets requiredQuestId undefined for side quest updates when empty", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: true,
        type: "side",
        requiredQuestId: undefined,
      })
      expect(result.body.requiredQuestId).toBeUndefined()
    })

    it("omits requiredQuestId for non-side quest updates", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: true,
        type: "main",
      })
      expect(result.body.requiredQuestId).toBeUndefined()
    })
  })

  describe("override as non-author", () => {
    it("returns kind 'override' when not quest author", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: false,
        type: "main",
      })
      expect(result.kind).toBe("override")
    })

    it("only includes name, description, duration in override body", () => {
      const result = getQuestSubmitBody({
        ...common,
        isEditMode: true,
        isQuestAuthor: false,
        type: "side",
        requiredQuestId: "prereq-1",
        startsAt: new Date(),
        submissionType: "image",
      })
      expect(Object.keys(result.body)).toEqual(["name", "description", "duration"])
    })
  })
})
