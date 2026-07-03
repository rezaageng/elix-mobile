import { render } from "@testing-library/react-native"

import type { GuildLeaderboardEntry } from "@/lib/api/schemas"
import LeaderboardRow from "@/components/guild/leaderboard-row"

jest.mock("expo-image", () => ({ Image: "Image" }))

function makeEntry(
  overrides: Partial<GuildLeaderboardEntry> = {}
): GuildLeaderboardEntry {
  return {
    id: "u-1",
    name: "Player One",
    username: "player1",
    // eslint-disable-next-line unicorn/no-null
    image: null,
    expThisWeek: 500,
    ...overrides,
  }
}

describe("LeaderboardRow - RankBadge", () => {
  it("renders gold medal for rank 1", () => {
    const { getByText } = render(
      <LeaderboardRow entry={makeEntry()} rank={1} />
    )
    // RankBadge renders 🥇 for rank 1
    expect(getByText("🥇")).toBeTruthy()
  })

  it("renders silver medal for rank 2", () => {
    const { getByText } = render(
      <LeaderboardRow entry={makeEntry()} rank={2} />
    )
    expect(getByText("🥈")).toBeTruthy()
  })

  it("renders bronze medal for rank 3", () => {
    const { getByText } = render(
      <LeaderboardRow entry={makeEntry()} rank={3} />
    )
    expect(getByText("🥉")).toBeTruthy()
  })

  it("renders rank number for rank 4", () => {
    const { getByText } = render(
      <LeaderboardRow entry={makeEntry()} rank={4} />
    )
    expect(getByText("4")).toBeTruthy()
  })

  it("renders rank number for rank 10", () => {
    const { getByText } = render(
      <LeaderboardRow entry={makeEntry()} rank={10} />
    )
    expect(getByText("10")).toBeTruthy()
  })

  it("renders player name and XP", () => {
    const { getByText } = render(
      <LeaderboardRow
        entry={makeEntry({ name: "Alice", expThisWeek: 1200 })}
        rank={2}
      />
    )
    expect(getByText("Alice")).toBeTruthy()
    expect(getByText("1200 XP")).toBeTruthy()
  })

  it("renders initial when no image", () => {
    const { getByText } = render(
      // eslint-disable-next-line unicorn/no-null
      <LeaderboardRow entry={makeEntry({ name: "Bob", image: null })} rank={5} />
    )
    expect(getByText("B")).toBeTruthy()
  })

  it("renders empty initial when name is empty (getInitial returns empty)", () => {
    const { queryByText } = render(
      <LeaderboardRow
        // eslint-disable-next-line unicorn/no-null
        entry={makeEntry({ name: "", image: null })}
        rank={3}
      />
    )
    // getInitial("") returns "" since empty string is not nullish
    // So no "?" is rendered
    expect(queryByText("?")).toBeNull()
  })
})
