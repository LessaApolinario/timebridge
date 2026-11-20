import { Timebridge } from "@/components/timebridge/timebridge"
import { writePreferences } from "@/lib/local-preferences"
import { defaultConfiguration, shareUrl } from "@/lib/url-state"
import { act, fireEvent, screen, within } from "@testing-library/react"
import { renderWithLocale as render } from "../../utils/render-with-locale"

const initialInstant = Date.UTC(2025, 0, 15, 13)
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
)

function loadComparison(instant = initialInstant, referenceId = "sao-paulo") {
  const url = shareUrl(window.location.origin, {
    ...defaultConfiguration,
    instant,
    referenceId,
  })
  window.history.replaceState(null, "", url)
}

function observedClocks() {
  return screen.getAllByRole("article").map((article) => {
    return within(article).getByRole("time").textContent
  })
}

function referenceClock() {
  return screen.getByLabelText(/^Horário de referência em /)
}

afterEach(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
  window.history.replaceState(null, "", "/")
  window.localStorage.clear()

  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, "clipboard")
  }
})

describe("Timebridge", () => {
  it("should update live, pause from the first edit and resume with Now", () => {
    jest.useFakeTimers({ now: initialInstant + 750 })
    const { unmount } = render(<Timebridge />)

    expect(screen.getByText("Ao vivo")).toBeVisible()
    expect(referenceClock()).toHaveTextContent("10:00:00")
    act(() => {
      jest.advanceTimersByTime(1_250)
    })
    expect(referenceClock()).toHaveTextContent("10:00:02")

    const input = screen.getByRole("textbox", { name: "Hora (24 h)" })
    fireEvent.change(input, { target: { value: "18:" } })
    expect(screen.getByText("Horário selecionado")).toBeVisible()
    expect(screen.getByRole("alert")).toBeVisible()
    act(() => {
      jest.advanceTimersByTime(3_000)
    })
    expect(referenceClock()).toHaveTextContent("10:00:02")

    fireEvent.change(input, { target: { value: "18:30" } })
    expect(referenceClock()).toHaveTextContent("18:30:00")
    fireEvent.click(screen.getByRole("button", { name: "Agora" }))
    expect(referenceClock()).toHaveTextContent("10:00:05")
    act(() => {
      jest.advanceTimersByTime(1_000)
    })
    expect(referenceClock()).toHaveTextContent("10:00:06")

    const timersBeforeUnmount = jest.getTimerCount()
    unmount()
    expect(jest.getTimerCount()).toBeLessThan(timersBeforeUnmount)
  })

  it("should keep a valid shared instant fixed even when it equals the initial current time", () => {
    jest.useFakeTimers({ now: initialInstant })
    loadComparison()
    render(<Timebridge />)

    expect(screen.getByText("Horário selecionado")).toBeVisible()
    act(() => {
      jest.advanceTimersByTime(5_000)
    })
    expect(referenceClock()).toHaveAttribute(
      "datetime",
      new Date(initialInstant).toISOString(),
    )
    expect(referenceClock()).toHaveTextContent("10:00:00")
  })

  it("should persist 12-hour displays while keeping conversion inputs and copied times in 24 hours", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    loadComparison(Date.UTC(2025, 0, 15, 18, 5, 9))
    const view = render(<Timebridge />)

    fireEvent.click(screen.getByRole("button", { name: "12 h" }))
    expect(referenceClock()).toHaveTextContent("03:05:09 PM")
    expect(observedClocks()).toEqual(["03:05 PM", "01:05 PM", "06:05 PM"])
    expect(screen.getByRole("textbox", { name: "Hora (24 h)" })).toHaveValue(
      "15:05",
    )
    fireEvent.click(screen.getByRole("button", { name: "Copiar horários" }))
    await screen.findByText("Horários copiados.")
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("São Paulo · 15:05"),
    )

    view.unmount()
    render(<Timebridge />)
    expect(screen.getByRole("button", { name: "12 h" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(referenceClock()).toHaveTextContent("03:05:09 PM")
  })

  it("should copy and restore cities, instant, duration and work hours", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    })
    loadComparison()
    const view = render(<Timebridge />)

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "xangai" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }))
    fireEvent.change(screen.getByRole("textbox", { name: "Hora (24 h)" }), {
      target: { value: "23:00" },
    })
    expect(screen.getAllByText("Dia seguinte")).toHaveLength(2)
    fireEvent.click(
      screen.getByRole("button", { name: "Usar Nova York como referência" }),
    )
    expect(screen.getByRole("textbox", { name: "Hora (24 h)" })).toHaveValue(
      "21:00",
    )

    fireEvent.click(screen.getByRole("button", { name: "60 min" }))
    const newYorkHours = screen.getByRole("group", { name: "Nova York" })
    fireEvent.change(
      within(newYorkHours).getByRole("textbox", { name: "Início" }),
      { target: { value: "10:00" } },
    )
    const towns = screen.getAllByRole("article").map((article) => {
      return within(article).getByRole("heading").textContent
    })
    const times = observedClocks()

    fireEvent.click(screen.getByRole("button", { name: "Copiar link" }))
    expect(await screen.findByText("Link copiado.")).toBeVisible()
    const link = writeText.mock.calls[0][0] as string
    view.unmount()
    writePreferences({
      configuration: defaultConfiguration,
      favorites: ["tokyo"],
    })
    window.history.replaceState(null, "", link)
    render(<Timebridge />)

    expect(
      screen.getAllByRole("article").map((article) => {
        return within(article).getByRole("heading").textContent
      }),
    ).toEqual(towns)
    expect(observedClocks()).toEqual(times)
    expect(screen.getByRole("textbox", { name: "Hora (24 h)" })).toHaveValue(
      "21:00",
    )
    expect(screen.getByRole("button", { name: "60 min" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(
      within(screen.getByRole("group", { name: "Nova York" })).getByRole(
        "textbox",
        { name: "Início" },
      ),
    ).toHaveValue("10:00")
  })

  it("should reject nonexistent time and require a choice for a repeated time", () => {
    loadComparison(Date.UTC(2025, 2, 9, 8), "new-york")
    render(<Timebridge />)

    const time = screen.getByRole("textbox", { name: "Hora (24 h)" })
    const copy = screen.getByRole("button", { name: "Copiar horários" })

    fireEvent.change(time, { target: { value: "02:30" } })
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Esse horário não existe",
    )
    expect(copy).toBeDisabled()
    fireEvent.change(screen.getByLabelText("Data"), {
      target: { value: "2025-11-02" },
    })
    fireEvent.change(time, { target: { value: "01:30" } })
    expect(screen.getByText(/Esse horário ocorre duas vezes/)).toBeVisible()
    expect(copy).toBeDisabled()
    fireEvent.click(
      screen.getByRole("button", { name: /2ª ocorrência.*UTC−05:00/ }),
    )

    expect(copy).toBeEnabled()
    expect(observedClocks()).toEqual(["03:30", "01:30", "06:30"])
  })

  it("should keep two cities and work with blocked storage and clipboard access", async () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked")
    })
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked")
    })
    loadComparison()
    render(<Timebridge />)

    fireEvent.click(
      screen.getByRole("button", { name: "Mover Londres para antes" }),
    )
    expect(
      within(screen.getAllByRole("article")[1]).getByRole("heading"),
    ).toHaveTextContent("Londres")
    fireEvent.click(screen.getByRole("button", { name: "Remover Londres" }))
    expect(
      screen.getByRole("button", { name: "Remover São Paulo" }),
    ).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Copiar horários" }))

    const manualCopy = await screen.findByRole("textbox", {
      name: "Texto para copiar",
    })
    expect(manualCopy).toHaveProperty(
      "value",
      expect.stringContaining("São Paulo · 10:00"),
    )
  })
})
