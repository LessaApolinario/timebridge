import { LocaleSelect } from "@/components/layout/locale-select"
import { fireEvent, screen, within } from "@testing-library/react"
import { renderWithLocale } from "../../utils/render-with-locale"

const mockReplace = jest.fn()
const originalPointerEvent = Object.getOwnPropertyDescriptor(
  window,
  "PointerEvent",
)

jest.mock("next/navigation", () => {
  return {
    usePathname: () => window.location.pathname,
    useRouter: () => ({ replace: mockReplace }),
  }
})

beforeAll(() => {
  if (typeof window.PointerEvent !== "function") {
    // Base UI dispatches a PointerEvent when Enter activates an option.
    Object.defineProperty(window, "PointerEvent", {
      configurable: true,
      value: MouseEvent,
    })
  }
})

afterAll(() => {
  if (originalPointerEvent) {
    Object.defineProperty(window, "PointerEvent", originalPointerEvent)
  } else {
    Reflect.deleteProperty(window, "PointerEvent")
  }
})

afterEach(() => {
  mockReplace.mockClear()
  window.history.replaceState(null, "", "/")
  document.cookie = "NEXT_LOCALE=; Max-Age=0; path=/"
})

describe("LocaleSelect", () => {
  it("should display the selected language and flag", () => {
    renderWithLocale(<LocaleSelect />)

    const trigger = screen.getByRole("combobox", { name: "Idioma" })
    expect(trigger).toHaveTextContent("Português (Brasil)")
    expect(trigger.querySelector("img")).toHaveAttribute("src", "/flags/br.svg")
  })

  it("should change the locale from the keyboard and preserve the full location", async () => {
    const suffix = "?cities=london%2Cshanghai&ref=shanghai#planejador"
    window.history.replaceState(null, "", `/pt-BR${suffix}`)
    renderWithLocale(<LocaleSelect />)

    const trigger = screen.getByRole("combobox", { name: "Idioma" })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "ArrowDown" })

    const options = within(await screen.findByRole("listbox"))
    const english = options.getByRole("option", { name: "English (US)" })
    const portuguese = options.getByRole("option", {
      name: "Português (Brasil)",
    })
    const chinese = options.getByRole("option", { name: "简体中文" })

    expect(english.querySelector("img")).toHaveAttribute("src", "/flags/us.svg")
    expect(portuguese.querySelector("img")).toHaveAttribute(
      "src",
      "/flags/br.svg",
    )
    expect(chinese.querySelector("img")).toHaveAttribute("src", "/flags/cn.svg")

    fireEvent.keyDown(portuguese, { key: "ArrowDown" })
    fireEvent.keyDown(chinese, { key: "Enter" })

    expect(mockReplace).toHaveBeenCalledWith(`/zh-CN${suffix}`, {
      scroll: false,
    })
    expect(document.cookie).toContain("NEXT_LOCALE=zh-CN")
  })
})
