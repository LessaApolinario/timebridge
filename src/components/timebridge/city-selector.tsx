import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { cities, maximumCities } from "@/features/timezones/data/cities"
import type { City } from "@/features/timezones/models/city"
import { MapPin, Plus, Search, Star } from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState } from "react"

interface CitySelectorProps {
  selectedIds: readonly string[]
  favoriteIds: readonly string[]
  suggestedId?: string
  replacing?: City
  onChoose: (id: string) => void
}

function searchKey(value: string, locale: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase(locale)
    .trim()
}

export function CitySelector({
  selectedIds,
  favoriteIds,
  suggestedId,
  replacing,
  onChoose,
}: CitySelectorProps) {
  const t = useTranslations("CitySelector")
  const cityName = useTranslations("Cities")
  const locale = useLocale()
  const { displayName } = useFormatter()

  const headingId = useId()
  const searchId = useId()
  const selectId = useId()

  const [query, setQuery] = useState("")
  const [candidateId, setCandidateId] = useState("")

  const searchField = useRef<HTMLInputElement>(null)

  const queryKey = searchKey(query, locale)

  const atLimit = !replacing && selectedIds.length >= maximumCities

  const results = cities
    .map((city) => {
      return {
        ...city,
        name: cityName(city.id),
        country: displayName(city.countryCode, { type: "region" }),
      }
    })
    .filter((city) => {
      return (
        !selectedIds.includes(city.id) &&
        searchKey(`${city.name} ${city.country} ${city.zone}`, locale).includes(
          queryKey,
        )
      )
    })
    .sort((first, second) => {
      return (
        Number(favoriteIds.includes(second.id)) -
          Number(favoriteIds.includes(first.id)) ||
        Number(second.id === suggestedId) - Number(first.id === suggestedId) ||
        first.name.localeCompare(second.name, locale)
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
        {replacing
          ? t("replace", { city: cityName(replacing.id) })
          : t("title")}
      </h3>
      {atLimit ? (
        <p className="mt-2 text-sm text-muted-foreground" role="status">
          {t("limit")}
        </p>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <Label htmlFor={searchId} className="grid gap-1.5">
              {t("search")}
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
                  placeholder={t("placeholder")}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setCandidateId("")
                  }}
                />
              </span>
            </Label>
            <div className="grid min-w-0 gap-1.5">
              <Label htmlFor={selectId}>{t("city")}</Label>
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
                  <NativeSelectOption value="">
                    {t("noOptions")}
                  </NativeSelectOption>
                )}
                {results.map((city) => {
                  const prefix = favoriteIds.includes(city.id) ? "★ " : ""
                  const suffix =
                    city.id === suggestedId ? ` · ${t("deviceZone")}` : ""

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
              {t(replacing ? "confirm" : "add")}
            </Button>
          </div>
          {!results.length && (
            <p className="mt-2 text-sm text-muted-foreground" role="status">
              {t("empty")}
            </p>
          )}
          {results.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {favoriteIds.includes(activeCandidate) && (
                <Star aria-label={t("favorite")} className="size-3" />
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
