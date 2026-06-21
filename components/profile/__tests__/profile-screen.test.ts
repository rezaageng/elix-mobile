import { getImageUploadInfo, getProfileDiff } from "@/lib/app-logic"

describe("getProfileDiff", () => {
  const current = { name: "Alice", username: "alice123" }

  it("returns empty object when nothing changed", () => {
    expect(getProfileDiff(current, { name: "Alice", username: "alice123" })).toEqual({})
  })

  it("returns only name when only name changed", () => {
    expect(
      getProfileDiff(current, { name: "Alice Updated", username: "alice123" })
    ).toEqual({ name: "Alice Updated" })
  })

  it("returns only username when only username changed", () => {
    expect(
      getProfileDiff(current, { name: "Alice", username: "alice_new" })
    ).toEqual({ username: "alice_new" })
  })

  it("returns both when both fields changed", () => {
    expect(
      getProfileDiff(current, { name: "Alice Updated", username: "alice_new" })
    ).toEqual({ name: "Alice Updated", username: "alice_new" })
  })

  it("handles null current username (treats as empty)", () => {
    const result = getProfileDiff(
      // eslint-disable-next-line unicorn/no-null -- testing null username
      { name: "Bob", username: null },
      { name: "Bob", username: "" }
    )
    expect(result).toEqual({})
  })

  it("sets username to undefined when clearing to empty string", () => {
    const result = getProfileDiff(
      { name: "Bob", username: "bob99" },
      { name: "Bob", username: "" }
    )
    expect(result).toEqual({ username: undefined })
  })
})

describe("getImageUploadInfo", () => {
  it("extracts filename and MIME from .jpg URI", () => {
    const info = getImageUploadInfo("file:///path/to/photo.jpg")
    expect(info).toEqual({ filename: "photo.jpg", mimeType: "image/jpg" })
  })

  it("extracts filename and MIME from .png URI", () => {
    const info = getImageUploadInfo("/storage/emulated/0/screenshot.png")
    expect(info).toEqual({ filename: "screenshot.png", mimeType: "image/png" })
  })

  it("falls back to photo.jpg and image/jpeg when no extension", () => {
    const info = getImageUploadInfo("file:///path/nophoto")
    expect(info).toEqual({ filename: "nophoto", mimeType: "image/jpeg" })
  })

  it("handles URI ending with slash (empty last segment — returns empty string)", () => {
    const info = getImageUploadInfo("file:///path/")
    expect(info).toEqual({ filename: "", mimeType: "image/jpeg" })
  })
})
