import { render } from "@testing-library/react-native"

import type { GuildMember } from "@/lib/api/schemas"
import MemberRow from "@/components/guild/member-row"

jest.mock("expo-image", () => ({ Image: "Image" }))
jest.mock("lucide-react-native", () => ({ MoreVertical: "MoreVertical" }))
jest.mock("@/lib/use-theme-color", () => ({ useThemeColor: () => "#8e8b82" }))

function makeMember(overrides: Partial<GuildMember> = {}): GuildMember {
  return {
    id: "m-1",
    name: "Test Member",
    // eslint-disable-next-line unicorn/no-null
    image: null,
    role: "member",
    status: "approved",
    ...overrides,
  }
}

describe("MemberRow - RoleBadge", () => {
  it('renders "Owner" badge for owner role', () => {
    const { getByText, queryByText } = render(
      <MemberRow
        member={makeMember({ role: "owner" })}
        guildId="g-1"
        canManage={false}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(getByText("Owner")).toBeTruthy()
    expect(queryByText("Admin")).toBeNull()
    expect(queryByText("Member")).toBeNull()
  })

  it('renders "Admin" badge for admin role', () => {
    const { getByText, queryByText } = render(
      <MemberRow
        member={makeMember({ role: "admin" })}
        guildId="g-1"
        canManage={false}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(getByText("Admin")).toBeTruthy()
    expect(queryByText("Owner")).toBeNull()
    expect(queryByText("Member")).toBeNull()
  })

  it('renders "Member" badge for member role', () => {
    const { getByText, queryByText } = render(
      <MemberRow
        member={makeMember({ role: "member" })}
        guildId="g-1"
        canManage={false}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(getByText("Member")).toBeTruthy()
    expect(queryByText("Owner")).toBeNull()
    expect(queryByText("Admin")).toBeNull()
  })

  it("renders member name", () => {
    const { getByText } = render(
      <MemberRow
        member={makeMember({ name: "Alice" })}
        guildId="g-1"
        canManage={false}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(getByText("Alice")).toBeTruthy()
  })

  it("shows action button when canManage, not current user, and not owner", () => {
    const { getByLabelText } = render(
      <MemberRow
        member={makeMember({ role: "admin" })}
        guildId="g-1"
        canManage={true}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(getByLabelText("Member actions")).toBeTruthy()
  })

  it("hides action button for current user", () => {
    const { queryByLabelText } = render(
      <MemberRow
        member={makeMember({ role: "member" })}
        guildId="g-1"
        canManage={true}
        isCurrentUser={true}
        onActionSheet={jest.fn()}
      />
    )
    expect(queryByLabelText("Member actions")).toBeNull()
  })

  it("hides action button for owner even when canManage", () => {
    const { queryByLabelText } = render(
      <MemberRow
        member={makeMember({ role: "owner" })}
        guildId="g-1"
        canManage={true}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(queryByLabelText("Member actions")).toBeNull()
  })

  it("hides action button when canManage is false", () => {
    const { queryByLabelText } = render(
      <MemberRow
        member={makeMember({ role: "member" })}
        guildId="g-1"
        canManage={false}
        isCurrentUser={false}
        onActionSheet={jest.fn()}
      />
    )
    expect(queryByLabelText("Member actions")).toBeNull()
  })
})
