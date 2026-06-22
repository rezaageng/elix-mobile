import { getZodErrorMessage } from "@/lib/form-utils"

describe("getZodErrorMessage", () => {
  it("returns undefined for falsy input", () => {
    expect(getZodErrorMessage()).toBeUndefined()
    expect(getZodErrorMessage("")).toBeUndefined()
  })

  it("returns first message from array", () => {
    const error = [{ message: "First error" }, { message: "Second error" }]
    expect(getZodErrorMessage(error)).toBe("First error")
  })

  it("returns issue message from ZodError-like object", () => {
    const error = {
      issues: [{ message: "Name is required" }],
    }
    expect(getZodErrorMessage(error)).toBe("Name is required")
  })

  it("returns first issue message when multiple issues", () => {
    const error = {
      issues: [
        { message: "Name is required" },
        { message: "Description is required" },
      ],
    }
    expect(getZodErrorMessage(error)).toBe("Name is required")
  })

  it("returns undefined when issues array is empty", () => {
    const error = { issues: [] }
    expect(getZodErrorMessage(error)).toBeUndefined()
  })

  it("returns undefined for unknown error shape", () => {
    expect(getZodErrorMessage({ random: true })).toBeUndefined()
  })
})
