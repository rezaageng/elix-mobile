import { buildListItems, formatDayLabel } from "@/lib/message-utils"

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

describe("formatDayLabel", () => {
  it('returns "Today" for today', () => {
    expect(formatDayLabel(new Date())).toBe("Today")
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(formatDayLabel(daysAgo(1))).toBe("Yesterday")
  })

  it("returns formatted date for older dates", () => {
    const date = new Date("2025-05-15T12:00:00.000Z")
    expect(formatDayLabel(date)).toBe("May 15")
  })
})

describe("buildListItems", () => {
  const makeMessage = (
    id: string,
    createdAt: string,
    overrides: Record<string, unknown> = {}
  ) => ({
    id,
    content: "hello",
    // eslint-disable-next-line unicorn/no-null
    attachmentUrl: null,
    createdAt,
    // eslint-disable-next-line unicorn/no-null
    user: { id: "u1", name: "User", username: "user", image: null },
    ...overrides,
  })

  const makePending = (id: string, createdAt: string) => ({
    id,
    content: "pending",
    attachments: [],
    status: "sending" as const,
    createdAt,
  })

  it("returns empty array for no messages", () => {
    expect(buildListItems([], [])).toEqual([])
  })

  it("inserts a separator for the first message day", () => {
    const items = buildListItems([makeMessage("m1", "2025-06-01T12:00:00.000Z")], [])
    expect(items).toHaveLength(2)
    expect(items[0].type).toBe("separator")
    expect(items[1].type).toBe("message")
  })

  it("does not duplicate separators for same-day messages", () => {
    const items = buildListItems(
      [
        makeMessage("m1", "2025-06-01T12:00:00.000Z"),
        makeMessage("m2", "2025-06-01T14:00:00.000Z"),
      ],
      []
    )
    expect(items).toHaveLength(3)
    expect(items[0].type).toBe("separator")
    expect(items[1].type).toBe("message")
    expect(items[2].type).toBe("message")
  })

  it("inserts a separator for different days", () => {
    const items = buildListItems(
      [
        makeMessage("m1", "2025-06-01T12:00:00.000Z"),
        makeMessage("m2", "2025-06-02T12:00:00.000Z"),
      ],
      []
    )
    expect(items).toHaveLength(4)
    expect(items[0].type).toBe("separator") // day 1
    expect(items[1].type).toBe("message")
    expect(items[2].type).toBe("separator") // day 2
    expect(items[3].type).toBe("message")
  })

  it("appends pending messages with separators", () => {
    const items = buildListItems(
      [makeMessage("m1", "2025-06-01T12:00:00.000Z")],
      [makePending("p1", "2025-06-02T12:00:00.000Z")]
    )
    expect(items).toHaveLength(4)
    expect(items[0].type).toBe("separator")
    expect(items[1].type).toBe("message")
    expect(items[2].type).toBe("separator")
    expect(items[3].type).toBe("pending")
  })

  it("groups pending messages on the same day as messages", () => {
    const items = buildListItems(
      [makeMessage("m1", "2025-06-01T12:00:00.000Z")],
      [makePending("p1", "2025-06-01T14:00:00.000Z")]
    )
    expect(items).toHaveLength(3)
    expect(items[0].type).toBe("separator")
    expect(items[1].type).toBe("message")
    expect(items[2].type).toBe("pending")
  })
})
