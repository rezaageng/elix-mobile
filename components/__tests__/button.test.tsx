import { render } from "@testing-library/react-native"
import { Text } from "react-native"

import { Button } from "@/components/button"

describe("Button", () => {
  it("renders with default primary variant", () => {
    const { getByText } = render(<Button title="Click Me" />)
    expect(getByText("Click Me")).toBeTruthy()
  })

  it("renders with secondary variant", () => {
    const { getByText } = render(
      <Button title="Secondary" variant="secondary" />
    )
    expect(getByText("Secondary")).toBeTruthy()
  })

  it("renders with outline variant", () => {
    const { getByText } = render(
      <Button title="Outline" variant="outline" />
    )
    expect(getByText("Outline")).toBeTruthy()
  })

  it("renders with destructive variant", () => {
    const { getByText } = render(
      <Button title="Delete" variant="destructive" />
    )
    expect(getByText("Delete")).toBeTruthy()
  })

  it("renders with ghost variant", () => {
    const { getByText } = render(
      <Button title="Ghost" variant="ghost" />
    )
    expect(getByText("Ghost")).toBeTruthy()
  })

  it("renders disabled state", () => {
    const { getByText } = render(
      <Button title="Disabled" disabled />
    )
    expect(getByText("Disabled")).toBeTruthy()
  })

  it("renders children instead of title text", () => {
    const { getByText, queryByText } = render(
      <Button>
        <Text>Child Content</Text>
      </Button>
    )
    expect(getByText("Child Content")).toBeTruthy()
    expect(queryByText("title")).toBeNull()
  })
})
