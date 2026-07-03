/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock("@/lib/auth-client", () => ({
  authClient: { getCookie: jest.fn() },
}))

describe("getGuildWebSocketUrl", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it("converts http:// to ws://", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://example.com"
    const { getGuildWebSocketUrl } = require("@/lib/api/guilds")
    expect(getGuildWebSocketUrl("guild-1")).toBe("ws://example.com/api/guilds/guild-1/ws")
  })

  it("converts https:// to wss://", () => {
    process.env.EXPO_PUBLIC_API_URL = "https://example.com"
    const { getGuildWebSocketUrl } = require("@/lib/api/guilds")
    expect(getGuildWebSocketUrl("guild-1")).toBe("wss://example.com/api/guilds/guild-1/ws")
  })

  it("appends token query parameter", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://example.com"
    const { getGuildWebSocketUrl } = require("@/lib/api/guilds")
    expect(getGuildWebSocketUrl("guild-1", "mytoken")).toBe(
      "ws://example.com/api/guilds/guild-1/ws?token=mytoken"
    )
  })

  it("encodes token with special characters", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://example.com"
    const { getGuildWebSocketUrl } = require("@/lib/api/guilds")
    expect(getGuildWebSocketUrl("guild-1", "tok+en/1")).toBe(
      "ws://example.com/api/guilds/guild-1/ws?token=tok%2Ben%2F1"
    )
  })

  it("handles BASE_URL without // (colon format)", () => {
    process.env.EXPO_PUBLIC_API_URL = "https:elix-dev.rezaa.me"
    const { getGuildWebSocketUrl } = require("@/lib/api/guilds")
    expect(getGuildWebSocketUrl("guild-1")).toBe(
      "wss:elix-dev.rezaa.me/api/guilds/guild-1/ws"
    )
  })
})
