import { getMimeTypeFromFilename } from "@/lib/file-utils"

describe("getMimeTypeFromFilename", () => {
  it("returns image/jpg for .jpg (maps extension literally)", () => {
    expect(getMimeTypeFromFilename("photo.jpg")).toBe("image/jpg")
  })

  it("returns image/jpeg for .jpeg", () => {
    expect(getMimeTypeFromFilename("image.jpeg")).toBe("image/jpeg")
  })

  it("returns image/png for .png", () => {
    expect(getMimeTypeFromFilename("screenshot.png")).toBe("image/png")
  })

  it("returns image/gif for .gif", () => {
    expect(getMimeTypeFromFilename("animation.gif")).toBe("image/gif")
  })

  it("returns image/webp for .webp", () => {
    expect(getMimeTypeFromFilename("image.webp")).toBe("image/webp")
  })

  it("returns image/pdf for .pdf", () => {
    expect(getMimeTypeFromFilename("doc.pdf")).toBe("image/pdf")
  })

  it("returns image/jpeg fallback when no extension", () => {
    expect(getMimeTypeFromFilename("photo")).toBe("image/jpeg")
  })

  it("handles full URI paths", () => {
    expect(
      getMimeTypeFromFilename(
        "file:///storage/emulated/0/DCIM/Camera/IMG_20250615.jpg"
      )
    ).toBe("image/jpg")
  })

  it("handles uppercase extensions", () => {
    expect(getMimeTypeFromFilename("image.PNG")).toBe("image/PNG")
  })

  it("handles multiple dots", () => {
    expect(getMimeTypeFromFilename("photo.final.png")).toBe("image/png")
  })
})
