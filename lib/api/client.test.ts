/* eslint-disable @typescript-eslint/no-require-imports, unicorn/no-useless-undefined */

import type { apiFetch as ApiFetchFunction } from "@/lib/api/client"
import { z } from "zod"

const mockGetCookie = jest.fn()

jest.mock("@/lib/auth-client", () => ({
  authClient: { getCookie: mockGetCookie },
}))

const TestSchema = z.object({ message: z.string() })
const validData = { message: "hello" }

describe("apiFetch", () => {
  let apiFetch: typeof ApiFetchFunction

  beforeAll(() => {
    process.env.EXPO_PUBLIC_API_URL = "http://test.example.com"
  })

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    globalThis.fetch = jest.fn()
    process.env.EXPO_PUBLIC_API_URL = "http://test.example.com"
    const clientModule = require("@/lib/api/client")
    apiFetch = clientModule.apiFetch
  })

  it("sets Content-Type to application/json for POST requests", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(validData),
    })

    await apiFetch("/api/test", { method: "POST" }, TestSchema)

    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0]
    expect(options.headers.get("Content-Type")).toBe("application/json")
  })

  it("skips Content-Type for FormData body", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(validData),
    })

    const formData = new FormData()
    await apiFetch("/api/upload", { method: "POST", body: formData }, TestSchema)

    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0]
    expect(options.headers.has("Content-Type")).toBe(false)
  })

  it("includes Cookie header when authClient provides cookies", async () => {
    mockGetCookie.mockReturnValue("session=abc123")
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(validData),
    })

    await apiFetch("/api/test", { method: "GET" }, TestSchema)

    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0]
    expect(options.headers.get("Cookie")).toBe("session=abc123")
  })

  it("returns undefined for 204 response", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    })

    const result = await apiFetch("/api/delete", { method: "DELETE" }, z.void())
    expect(result).toBeUndefined()
  })

  it("parses and returns validated data on success", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(validData),
    })

    const result = await apiFetch("/api/test", { method: "GET" }, TestSchema)
    expect(result).toEqual(validData)
  })

  it("throws ApiError on validation failure", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: 42 }),
    })

    await expect(
      apiFetch("/api/test", { method: "GET" }, TestSchema)
    ).rejects.toMatchObject({
      status: 200,
      code: "VALIDATION_ERROR",
    })
  })

  it("throws ApiError on HTTP error with message from body", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "Bad request" }),
    })

    await expect(
      apiFetch("/api/test", { method: "POST" }, TestSchema)
    ).rejects.toMatchObject({
      message: "Bad request",
      status: 400,
    })
  })

  it("throws ApiError with envelope error.message and code", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      json: () =>
        Promise.resolve({ error: { message: "Forbidden", code: "FORBIDDEN" } }),
    })

    await expect(
      apiFetch("/api/test", { method: "GET" }, TestSchema)
    ).rejects.toMatchObject({
      message: "Forbidden",
      status: 403,
      code: "FORBIDDEN",
    })
  })

  it("throws ApiError on HTTP error when body cannot be parsed", async () => {
    mockGetCookie.mockReturnValue(undefined)
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid json")),
    })

    await expect(
      apiFetch("/api/test", { method: "GET" }, TestSchema)
    ).rejects.toMatchObject({
      status: 500,
    })
  })
})
