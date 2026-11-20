import { Timebridge } from "@/components/timebridge/timebridge"
import {
  defaultConfiguration,
  restoreShareState,
  shareUrl,
} from "@/lib/url-state"
import { fireEvent, screen, within } from "@testing-library/react"
import { renderWithLocale } from "../../utils/render-with-locale"

const legacyComparison = {
  cityIds: ["new-york", "shanghai"],
  referenceId: "shanghai",
  instant: Date.UTC(2025, 0, 15, 13),
  duration: 60 as const,
  work: {
    "new-york": { start: "10:00", end: "18:00" },
    shanghai: { start: "09:00", end: "17:00" },
  },
}
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
)

afterEach(() => {
  window.history.replaceState(null, "", "/")
  window.localStorage.clear()

  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, "clipboard")
  }
})

describe("localized comparison", () => {
  it("should search by a localized country and display the matching city", async () => {
    renderWithLocale(<Timebridge />, "zh-CN")

    expect(screen.getByRole("heading", { name: "会议规划" })).toBeVisible()
    const query = screen.getByRole("searchbox", { name: "按城市或国家搜索" })
    fireEvent.change(query, { target: { value: "日本" } })

    const cities = screen.getByRole("combobox", { name: "城市" })
    expect(cities).toHaveTextContent("东京 · 日本")
    cities.focus()
    fireEvent.keyDown(cities, { key: "ArrowDown" })
    const options = within(await screen.findByRole("listbox"))
    expect(options.getByRole("option", { name: /东京 · 日本/ })).toHaveAttribute(
      "aria-selected",
      "true",
    )
  })

  it("should copy a localized link from a comparison opened at the legacy root", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    window.history.replaceState(
      null,
      "",
      shareUrl(window.location.origin, legacyComparison),
    )

    renderWithLocale(<Timebridge />, "en-US")

    const shanghai = screen.getByLabelText(/^Reference time in Shanghai/)
    expect(shanghai).toHaveAttribute("datetime", "2025-01-15T13:00:00.000Z")
    fireEvent.click(screen.getByRole("button", { name: "Copy link" }))
    expect(await screen.findByText("Link copied.")).toBeVisible()

    const url = new URL(writeText.mock.calls[0][0])
    expect(url.pathname).toBe("/en-US")
    expect(
      restoreShareState(url.search, { ...defaultConfiguration, instant: 0 }),
    ).toEqual(legacyComparison)
  })
})
