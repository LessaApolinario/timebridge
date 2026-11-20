import { fireEvent, render, screen, within } from "@testing-library/react"

import { Timebridge } from "@/components/timebridge/timebridge"
import { writePreferences } from "@/lib/local-preferences"
import { defaultConfiguration, shareUrl } from "@/lib/url-state"

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

afterEach(() => {
  jest.restoreAllMocks()
  window.history.replaceState(null, "", "/")
  window.localStorage.clear()

  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard)
  } else {
    Reflect.deleteProperty(navigator, "clipboard")
  }
})

describe("Timebridge", () => {
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
