import { updateWeekday } from "@/lib/date-utils"

// Helper: create a date in local timezone with a given day of week
function makeDate(dayOfWeek: number, date: number, hours = 10): Date {
  // Months are 0-indexed; 5 = June
  return new Date(2025, 5, date, hours, 0, 0, 0)
}

describe("updateWeekday", () => {
  it("returns same date when already on the target weekday", () => {
    // June 22 2025 is a Sunday (day 0) in local time
    const date = makeDate(0, 22, 10)
    const result = updateWeekday(date, 0)
    expect(result.getDay()).toBe(0)
    expect(result.getDate()).toBe(22)
    expect(result.getHours()).toBe(10)
  })

  it("moves forward to Thursday from Monday", () => {
    // June 23 is Monday (day 1)
    const date = makeDate(1, 23, 8)
    const result = updateWeekday(date, 4) // Thursday
    expect(result.getDay()).toBe(4)
    // Monday 23 → Thursday 26 (3 days forward)
    expect(result.getDate()).toBe(26)
    expect(result.getHours()).toBe(8)
  })

  it("moves backward to Monday from Friday", () => {
    // June 27 is Friday (day 5)
    const date = makeDate(5, 27, 14)
    const result = updateWeekday(date, 1) // Monday
    expect(result.getDay()).toBe(1)
    // Friday 27 → Monday 23 (4 days backward)
    expect(result.getDate()).toBe(23)
    expect(result.getHours()).toBe(14)
  })

  it("wraps across month boundaries forward", () => {
    // June 29 is Sunday (day 0)
    const date = makeDate(0, 29, 12)
    // Jump to Wednesday (day 3) → July 2
    const result = updateWeekday(date, 3)
    expect(result.getDay()).toBe(3)
    expect(result.getDate()).toBe(2)
    expect(result.getMonth()).toBe(6) // July (0-indexed)
  })

  it("wraps across month boundaries backward", () => {
    // July 3 is Thursday (day 4)
    const date = new Date(2025, 6, 3, 9, 0, 0, 0)
    // Jump to Monday (day 1) → June 30
    const result = updateWeekday(date, 1)
    expect(result.getDay()).toBe(1)
    expect(result.getDate()).toBe(30)
    expect(result.getMonth()).toBe(5) // June (0-indexed)
  })

  it("preserves time when moving across week", () => {
    // June 25 is Wednesday (day 3)
    const date = new Date(2025, 5, 25, 15, 45, 30, 0)
    const result = updateWeekday(date, 0) // Sunday
    expect(result.getHours()).toBe(15)
    expect(result.getMinutes()).toBe(45)
    expect(result.getSeconds()).toBe(30)
  })

  it("moves from Saturday back to previous Sunday", () => {
    // June 28 is Saturday (day 6)
    const date = makeDate(6, 28, 20)
    // diff = 0 - 6 = -6, so setDate(28 - 6) = June 22 (Sunday)
    const result = updateWeekday(date, 0) // Sunday
    expect(result.getDay()).toBe(0)
    expect(result.getDate()).toBe(22)
  })

  it("moves from Sunday forward to Saturday", () => {
    // June 22 is Sunday (day 0)
    const date = makeDate(0, 22, 20)
    // diff = 6 - 0 = 6, so setDate(22 + 6) = June 28 which is Saturday
    const result = updateWeekday(date, 6) // Saturday
    expect(result.getDay()).toBe(6)
    expect(result.getDate()).toBe(28)
  })

  it("does not mutate the original date", () => {
    const date = makeDate(1, 23, 10) // Monday
    const original = new Date(date)
    updateWeekday(date, 5) // Friday
    expect(date.getTime()).toBe(original.getTime())
  })
})
