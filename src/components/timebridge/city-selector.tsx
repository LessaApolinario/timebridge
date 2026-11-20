import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cities, maximumCities } from "@/features/timezones/data/cities"
import type { City } from "@/features/timezones/models/city"
import { MapPin, Plus, Search, Star } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

interface CitySelectorProps {
  selectedIds: readonly string[]
  favoriteIds: readonly string[]
  suggestedId?: string
  replacing?: City
  onChoose: (id: string) => void
}

function searchKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
}

export function CitySelector({
  selectedIds,
  favoriteIds,
  suggestedId,
  replacing,
  onChoose,
}: CitySelectorProps) {
  const headingId = useId()
  const searchId = useId()
  const selectId = useId()

  const [query, setQuery] = useState("")
  const [candidateId, setCandidateId] = useState("")

  const searchField = useRef<HTMLInputElement>(null)

  const queryKey = searchKey(query)

  const atLimit = !replacing && selectedIds.length >= maximumCities

  const results = cities
    .filter((city) => {
      return (
        !selectedIds.includes(city.id) &&
        searchKey(`${city.name} ${city.country} ${city.zone}`).includes(
          queryKey,
        )
      )
    })
    .sort((first, second) => {
      return (
        Number(favoriteIds.includes(second.id)) -
          Number(favoriteIds.includes(first.id)) ||
        Number(second.id === suggestedId) - Number(first.id === suggestedId) ||
        first.name.localeCompare(second.name, "pt-BR")
      )
    })

  const activeCandidate = results.some(({ id }) => {
    return id === candidateId
  })
    ? candidateId
    : (results[0]?.id ?? "")

  useEffect(() => {
    if (replacing) {
      searchField.current?.focus()
    }
  }, [replacing])

  return (
    <form
      aria-labelledby={headingId}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
      onSubmit={(event) => {
        event.preventDefault()

        if (activeCandidate && !atLimit) {
          onChoose(activeCandidate)
          setQuery("")
          setCandidateId("")
        }
      }}
    >
      <h3
        id={headingId}
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <MapPin aria-hidden="true" className="size-4 text-accent-foreground" />
        {replacing ? `Trocar ${replacing.name}` : "Adicionar cidade"}
      </h3>
      {atLimit ? (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          Limite de cinco cidades atingido. Remova ou troque uma cidade para
          continuar.
        </p>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <Label htmlFor={searchId} className="grid gap-1.5">
              Buscar por cidade ou país
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground"
                />
                <Input
                  id={searchId}
                  ref={searchField}
                  className="min-h-10 bg-background pl-9"
                  type="search"
                  placeholder="Ex.: Brasil ou Tóquio"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setCandidateId("")
                  }}
                />
              </span>
            </Label>
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor={selectId}>Cidade</Label>
              <NativeSelect
                id={selectId}
                className="w-full min-w-0 [&>select]:min-h-10 [&>select]:bg-background"
                disabled={!results.length}
                value={activeCandidate}
                onChange={(event) => {
                  setCandidateId(event.target.value)
                }}
              >
                {!results.length && (
                  <NativeSelectOption value="">Sem opções</NativeSelectOption>
                )}
                {results.map((city) => {
                  const prefix = favoriteIds.includes(city.id) ? "★ " : ""
                  const suffix =
                    city.id === suggestedId ? " · fuso do dispositivo" : ""

                  return (
                    <NativeSelectOption key={city.id} value={city.id}>
                      {prefix}
                      {city.name} · {city.country}
                      {suffix}
                    </NativeSelectOption>
                  )
                })}
              </NativeSelect>
            </div>
            <Button
              type="submit"
              className="min-h-10 rounded-full px-4"
              disabled={!activeCandidate}
            >
              <Plus aria-hidden="true" />
              {replacing ? "Confirmar troca" : "Adicionar"}
            </Button>
          </div>
          {!results.length && (
            <p className="mt-2 text-sm text-muted-foreground" role="status">
              Nenhuma cidade encontrada.
            </p>
          )}
          {results.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {favoriteIds.includes(activeCandidate) && (
                <Star aria-label="Favorita" className="size-3" />
              )}
              {
                results.find(({ id }) => {
                  return id === activeCandidate
                })?.zone
              }
            </p>
          )}
        </>
      )}
    </form>
  )
}
