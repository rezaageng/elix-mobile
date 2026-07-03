import { getXpPercent } from "@/lib/app-logic"

describe("getXpPercent", () => {
  it("returns 0 when XP is 0", () => {
    expect(getXpPercent(0)).toBe(0)
  })

  it("returns 50 for 500 XP (mid-level)", () => {
    expect(getXpPercent(500)).toBe(50)
  })

  it("returns 100 for 1000 XP (exactly level threshold)", () => {
    expect(getXpPercent(1000)).toBe(100)
  })

  it("returns 25 for 250 XP", () => {
    expect(getXpPercent(250)).toBe(25)
  })

  it("caps at 100 when XP exceeds threshold", () => {
    expect(getXpPercent(1500)).toBe(100)
    expect(getXpPercent(2000)).toBe(100)
    expect(getXpPercent(9999)).toBe(100)
  })

  it("rounds to nearest integer", () => {
    expect(getXpPercent(1)).toBe(0) // 0.1% rounded
    expect(getXpPercent(5)).toBe(1) // 0.5% rounded up
    expect(getXpPercent(333)).toBe(33) // 33.3% rounded
    expect(getXpPercent(667)).toBe(67) // 66.7% rounded up
  })

  it("returns 1 for 5 XP (typical edge)", () => {
    expect(getXpPercent(5)).toBe(1)
  })
})
