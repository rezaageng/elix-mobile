import { QuestSchema, ClassSchema, PublicUserSchema, CreateQuestBodySchema, DataWrapperSchema } from "@/lib/api/schemas"

const validUUID = "00000000-0000-0000-0000-000000000000"
const validDate = "2025-06-01T00:00:00.000Z"

describe("QuestSchema", () => {
  const validQuest = {
    id: validUUID,
    classId: validUUID,
    name: "Test Quest",
    description: "A test quest",
    type: "main",
    submissionType: "text",
    duration: 7,
    requiredQuestId: null,
    createdAt: validDate,
    updatedAt: validDate,
  }

  it("accepts main type", () => {
    expect(QuestSchema.safeParse(validQuest).success).toBe(true)
  })

  it("accepts side type", () => {
    expect(QuestSchema.safeParse({ ...validQuest, type: "side" }).success).toBe(true)
  })

  it("accepts recurring type", () => {
    expect(QuestSchema.safeParse({ ...validQuest, type: "recurring" }).success).toBe(true)
  })

  it("rejects missing id", () => {
    const { id: _, ...rest } = validQuest
    expect(QuestSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects non-uuid id", () => {
    expect(QuestSchema.safeParse({ ...validQuest, id: "not-a-uuid" }).success).toBe(false)
  })

  it("rejects non-integer duration", () => {
    expect(QuestSchema.safeParse({ ...validQuest, duration: "seven" }).success).toBe(false)
  })

  it("rejects invalid createdAt", () => {
    expect(QuestSchema.safeParse({ ...validQuest, createdAt: "not-a-date" }).success).toBe(false)
  })

  it("rejects missing name", () => {
    const { name: _, ...rest } = validQuest
    expect(QuestSchema.safeParse(rest).success).toBe(false)
  })
})

describe("ClassSchema", () => {
  const validClass = {
    id: validUUID,
    name: "Warrior",
    description: "A warrior class",
    authorId: "user1",
    createdAt: validDate,
    updatedAt: validDate,
  }

  it("accepts a valid class", () => {
    expect(ClassSchema.safeParse(validClass).success).toBe(true)
  })

  it("rejects missing name", () => {
    const { name: _, ...rest } = validClass
    expect(ClassSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects non-uuid id", () => {
    expect(ClassSchema.safeParse({ ...validClass, id: "bad-id" }).success).toBe(false)
  })

  it("accepts nullable requirements", () => {
    expect(ClassSchema.safeParse({ ...validClass, requirements: null }).success).toBe(true)
  })

  it("accepts object requirements", () => {
    expect(ClassSchema.safeParse({ ...validClass, requirements: { level: 5 } }).success).toBe(true)
  })
})

describe("PublicUserSchema", () => {
  const validUser = {
    id: "user1",
    name: "Test User",
    username: "testuser",
    displayUsername: "TestUser",
    image: "https://example.com/avatar.png",
    level: 10,
    xp: 1000,
    gold: 500,
    streak: 5,
    longestStreak: 10,
    restorableStreak: 0,
    classes: [],
    activeClass: null,
    activeBuffs: [],
    createdAt: validDate,
  }

  it("accepts a valid public user", () => {
    expect(PublicUserSchema.safeParse(validUser).success).toBe(true)
  })

  it("accepts nullable image", () => {
    expect(PublicUserSchema.safeParse({ ...validUser, image: null }).success).toBe(true)
  })

  it("rejects missing streak", () => {
    const { streak: _, ...rest } = validUser
    expect(PublicUserSchema.safeParse(rest).success).toBe(false)
  })

  it("rejects string level instead of number", () => {
    expect(PublicUserSchema.safeParse({ ...validUser, level: "ten" }).success).toBe(false)
  })

  it("rejects invalid image URL", () => {
    expect(PublicUserSchema.safeParse({ ...validUser, image: "not-a-url" }).success).toBe(false)
  })

  it("rejects missing classes array", () => {
    const { classes: _, ...rest } = validUser
    expect(PublicUserSchema.safeParse(rest).success).toBe(false)
  })

  it("defaults activeBuffs to [] when omitted", () => {
    const { activeBuffs: _, ...rest } = validUser
    const result = PublicUserSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.activeBuffs).toEqual([])
    }
  })
})

describe("CreateQuestBodySchema", () => {
  const validBody = {
    name: "New Quest",
    description: "Do something",
    type: "daily" as const,
    submissionType: "text" as const,
    duration: 1,
  }

  it("accepts minimum valid body", () => {
    expect(CreateQuestBodySchema.safeParse(validBody).success).toBe(true)
  })

  it("accepts all valid types (daily, weekly, main, side, event)", () => {
    for (const type of ["daily", "weekly", "main", "side", "event"]) {
      expect(CreateQuestBodySchema.safeParse({ ...validBody, type }).success).toBe(true)
    }
  })

  it("rejects invalid type", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, type: "invalid" }).success).toBe(false)
  })

  it("rejects invalid submissionType", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, submissionType: "video" }).success).toBe(false)
  })

  it("rejects string duration", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, duration: "1" }).success).toBe(false)
  })

  it("allows negative duration (no positivity constraint)", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, duration: -1 }).success).toBe(true)
  })

  it("accepts optional requiredQuestId as null", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, requiredQuestId: null }).success).toBe(true)
  })

  it("rejects non-uuid requiredQuestId", () => {
    expect(CreateQuestBodySchema.safeParse({ ...validBody, requiredQuestId: "bad" }).success).toBe(false)
  })

  it("rejects missing name", () => {
    const { name: _, ...rest } = validBody
    expect(CreateQuestBodySchema.safeParse(rest).success).toBe(false)
  })
})

describe("DataWrapperSchema", () => {
  const wrappedQuest = {
    data: {
      id: validUUID,
      classId: validUUID,
      name: "Wrapped",
      description: "In a wrapper",
      type: "main",
      submissionType: "text",
      duration: 3,
      requiredQuestId: null,
      createdAt: validDate,
      updatedAt: validDate,
    },
  }

  it("accepts valid wrapped data", () => {
    const schema = DataWrapperSchema(QuestSchema)
    expect(schema.safeParse(wrappedQuest).success).toBe(true)
  })

  it("rejects invalid inner data", () => {
    const schema = DataWrapperSchema(QuestSchema)
    expect(
      schema.safeParse({ data: { ...wrappedQuest.data, id: "bad-uuid" } }).success
    ).toBe(false)
  })

  it("rejects missing data key", () => {
    const schema = DataWrapperSchema(QuestSchema)
    expect(schema.safeParse({}).success).toBe(false)
  })
})
