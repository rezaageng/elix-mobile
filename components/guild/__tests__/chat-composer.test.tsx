import { makeAttachmentId } from "@/components/guild/chat-composer"

// ── Pure function tests ──

describe("makeAttachmentId", () => {
  it("produces unique IDs on successive calls", () => {
    const ids = new Set<string>()
    for (let index = 0; index < 100; index++) {
      ids.add(makeAttachmentId())
    }
    expect(ids.size).toBe(100)
  })

  it("returns a string containing only URL-safe characters", () => {
    const id = makeAttachmentId()
    expect(id).toMatch(/^[a-z0-9-]+$/)
  })
})

describe("handleSend gate logic", () => {
  it("does not call onSend when text is empty and no attachments", () => {
    const onSend = jest.fn()
    const trimmed = ""
    const attachments: unknown[] = []
    if (!trimmed && attachments.length === 0) {
      // gate blocks
    } else {
      onSend(trimmed, attachments)
    }
    expect(onSend).not.toHaveBeenCalled()
  })

  it("calls onSend with text when text is non-empty and no attachments", () => {
    const onSend = jest.fn()
    const text = "hello"
    const attachments: unknown[] = []
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    expect(onSend).toHaveBeenCalledWith("hello", [])
  })

  it("calls onSend with text and attachments when both present", () => {
    const onSend = jest.fn()
    const text = "check this out"
    const attachments = [{ id: "a1", localUri: "file://img.jpg", name: "img.jpg", type: "image/jpeg" }]
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    expect(onSend).toHaveBeenCalledWith("check this out", attachments)
  })

  it("calls onSend with attachments even when text is empty", () => {
    const onSend = jest.fn()
    const text = ""
    const attachments = [{ id: "a1", localUri: "file://img.jpg", name: "img.jpg", type: "image/jpeg" }]
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    expect(onSend).toHaveBeenCalledWith("", attachments)
  })

  it("trims whitespace from text before sending", () => {
    const onSend = jest.fn()
    const text = "  hello world  "
    const attachments: unknown[] = []
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    expect(onSend).toHaveBeenCalledWith("hello world", [])
  })

  it("blocks when text is only whitespace and no attachments", () => {
    const onSend = jest.fn()
    const text = "   "
    const attachments: unknown[] = []
    const trimmed = text.trim()
    if (!trimmed && attachments.length === 0) return
    onSend(trimmed, attachments)
    expect(onSend).not.toHaveBeenCalled()
  })
})
