import { CitySelector } from "@/components/timebridge/city-selector"
import { citiesById, defaultCityIds } from "@/features/timezones/data/cities"
import { fireEvent, screen } from "@testing-library/react"
import { renderWithLocale as render } from "../../utils/render-with-locale"

describe("CitySelector", () => {
  it("should search by city and country without requiring accents", async () => {
    const chooseCity = jest.fn()
    render(
      <CitySelector
        selectedIds={defaultCityIds}
        favoriteIds={[]}
        onChoose={chooseCity}
      />,
    )
    const search = screen.getByRole("searchbox", {
      name: "Buscar por cidade ou país",
    })

    fireEvent.change(search, { target: { value: "toquio" } })
    const trigger = screen.getByRole("combobox", { name: "Cidade" })
    expect(trigger).toHaveTextContent("Tóquio · Japão")
    expect(screen.getByText("Asia/Tokyo")).toBeVisible()

    fireEvent.change(search, { target: { value: "brasil" } })
    trigger.focus()
    fireEvent.keyDown(trigger, { key: "ArrowDown" })
    const recife = await screen.findByRole("option", {
      name: "Recife · Brasil",
    })
    expect(
      screen.queryByRole("option", { name: /São Paulo/ }),
    ).not.toBeInTheDocument()
    fireEvent.pointerDown(recife)
    fireEvent.click(recife)
    expect(trigger).toHaveTextContent("Recife · Brasil")
    expect(chooseCity).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }))

    expect(chooseCity).toHaveBeenCalledWith("recife")
    expect(search).toHaveValue("")
  })

  it("should display an empty state and prevent adding a sixth city", () => {
    const chooseCity = jest.fn()
    const { rerender } = render(
      <CitySelector
        selectedIds={defaultCityIds}
        favoriteIds={[]}
        onChoose={chooseCity}
      />,
    )

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Atlantis" },
    })
    expect(screen.getByRole("status")).toHaveTextContent(
      "Nenhuma cidade encontrada",
    )
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeDisabled()

    const fullSelection = [...defaultCityIds, "shanghai", "tokyo"]
    rerender(
      <CitySelector
        selectedIds={fullSelection}
        favoriteIds={[]}
        onChoose={chooseCity}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent(
      "Limite de cinco cidades",
    )
    expect(
      screen.queryByRole("button", { name: "Adicionar" }),
    ).not.toBeInTheDocument()

    rerender(
      <CitySelector
        selectedIds={fullSelection}
        favoriteIds={[]}
        replacing={citiesById.get("tokyo")}
        onChoose={chooseCity}
      />,
    )
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "seul" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirmar troca" }))
    expect(chooseCity).toHaveBeenCalledWith("seoul")
  })
})
