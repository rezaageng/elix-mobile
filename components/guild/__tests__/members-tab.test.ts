import { getMemberActions } from "@/lib/app-logic"
import type { MemberAction } from "@/lib/app-logic"

describe("getMemberActions", () => {
  const ownerUser = { id: "owner-id", role: "owner", name: "Owner" }
  const adminUser = { id: "admin-id", role: "admin", name: "Admin" }
  const memberUser = { id: "member-id", role: "member", name: "Member" }

  describe("owner role actions", () => {
    it("can promote a member to admin", () => {
      const actions = getMemberActions(memberUser, "owner", "owner-id")
      expect(actions).toContainEqual(
        expect.objectContaining({ label: "Promote to Admin", kind: "promote" })
      )
    })

    it("can demote an admin to member", () => {
      const actions = getMemberActions(adminUser, "owner", "owner-id")
      expect(actions).toContainEqual(
        expect.objectContaining({ label: "Demote to Member", kind: "demote" })
      )
    })

    it("cannot promote/demote another owner", () => {
      const otherOwner = { id: "other-owner", role: "owner", name: "OtherOwner" }
      const actions = getMemberActions(otherOwner, "owner", "owner-id")
      expect(actions.find((a: MemberAction) => a.kind === "promote")).toBeUndefined()
      expect(actions.find((a: MemberAction) => a.kind === "demote")).toBeUndefined()
    })

    it("can kick non-owner members", () => {
      const actions = getMemberActions(memberUser, "owner", "owner-id")
      expect(actions).toContainEqual(
        expect.objectContaining({ label: "Kick", kind: "kick" })
      )
    })

    it("cannot kick self", () => {
      const actions = getMemberActions(ownerUser, "owner", "owner-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
    })

    it("cannot kick another owner", () => {
      const otherOwner = { id: "other-owner", role: "owner", name: "OtherOwner" }
      const actions = getMemberActions(otherOwner, "owner", "owner-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
    })
  })

  describe("admin role actions", () => {
    it("can kick non-owner members", () => {
      const actions = getMemberActions(memberUser, "admin", "admin-id")
      expect(actions).toContainEqual(
        expect.objectContaining({ label: "Kick", kind: "kick" })
      )
    })

    it("cannot kick owner", () => {
      const actions = getMemberActions(ownerUser, "admin", "admin-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
    })

    it("cannot kick self", () => {
      const actions = getMemberActions(adminUser, "admin", "admin-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
    })

    it("cannot promote/demote (only owner can)", () => {
      const actions = getMemberActions(memberUser, "admin", "admin-id")
      expect(actions.find((a: MemberAction) => a.kind === "promote" || a.kind === "demote")).toBeUndefined()
    })
  })

  describe("member role actions", () => {
    it("cannot kick anyone", () => {
      let actions = getMemberActions(memberUser, "member", "member-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
      actions = getMemberActions(adminUser, "member", "member-id")
      expect(actions.find((a: MemberAction) => a.kind === "kick")).toBeUndefined()
    })

    it("cannot promote/demote anyone", () => {
      let actions = getMemberActions(memberUser, "member", "member-id")
      expect(actions.find((a: MemberAction) => a.kind === "promote" || a.kind === "demote")).toBeUndefined()
      actions = getMemberActions(adminUser, "member", "member-id")
      expect(actions.find((a: MemberAction) => a.kind === "promote" || a.kind === "demote")).toBeUndefined()
    })
  })

  describe("always includes Cancel", () => {
    it("includes cancel action as last option", () => {
      const actions = getMemberActions(memberUser, "member", "member-id")
      const last = actions.at(-1)
      expect(last).toMatchObject({ label: "Cancel", kind: "cancel" })
    })

    it("for owner, cancel is last after other actions", () => {
      const actions = getMemberActions(memberUser, "owner", "owner-id")
      expect(actions.at(-1)).toMatchObject({ kind: "cancel" })
    })
  })
})
