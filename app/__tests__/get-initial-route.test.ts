import { getInitialRoute } from "@/lib/app-logic"

describe("getInitialRoute", () => {
  it("returns /login when no session and not on login", () => {
    expect(getInitialRoute(undefined, false, ["(tabs)"])).toBe("/login")
    expect(getInitialRoute(undefined, false, ["(tabs)", "inventory"])).toBe("/login")
  })

  it("returns null when no session and already on login (no redirect)", () => {
    expect(getInitialRoute(undefined, false, ["login"])).toBeNull()
    expect(getInitialRoute(undefined, false, ["login", "some"])).toBeNull()
  })

  it("returns null when isPending (loading state)", () => {
    expect(getInitialRoute(undefined, true, [])).toBeNull()
    expect(getInitialRoute(undefined, true, ["(tabs)"])).toBeNull()
    expect(getInitialRoute({ user: {} } as never, true, ["(tabs)"])).toBeNull()
  })

  it("returns /roles when session but no activeClassId and not on roles", () => {
    const session = { user: { activeClassId: undefined } }
    expect(getInitialRoute(session, false, ["(tabs)"])).toBe("/roles")
    expect(getInitialRoute(session, false, ["(tabs)", "inventory"])).toBe("/roles")
  })

  it("returns null when session with activeClassId and on (tabs) (stay)", () => {
    const session = { user: { activeClassId: "class-1" } }
    expect(getInitialRoute(session, false, ["(tabs)"])).toBeNull()
    expect(getInitialRoute(session, false, ["(tabs)", "inventory"])).toBeNull()
  })

  it("redirects from /login to /(tabs) when session has activeClassId", () => {
    const session = { user: { activeClassId: "class-1" } }
    expect(getInitialRoute(session, false, ["login"])).toBe("/(tabs)")
  })

  it("redirects from /login to /roles when session has no activeClassId", () => {
    const session = { user: { activeClassId: undefined } }
    expect(getInitialRoute(session, false, ["login"])).toBe("/roles")
    const sessionUndefined = { user: {} }
    expect(getInitialRoute(sessionUndefined, false, ["login"])).toBe("/roles")
  })

  it("returns null when session with no activeClassId is already on /roles", () => {
    const session = { user: { activeClassId: undefined } }
    expect(getInitialRoute(session, false, ["roles"])).toBeNull()
    expect(getInitialRoute(session, false, ["roles", "create"])).toBeNull()
  })

  it("returns null when session with activeClassId is on /roles", () => {
    const session = { user: { activeClassId: "class-1" } }
    expect(getInitialRoute(session, false, ["roles"])).toBeNull()
  })
})
