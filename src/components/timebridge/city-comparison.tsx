import { Button } from "@/components/ui/button"
import { citiesById, minimumCities } from "@/features/timezones/data/cities"
import type { useTimebridge } from "@/hooks/use-timebridge"
import { useLocalDate } from "@/i18n/use-local-date"
import { timezones } from "@/lib/di/container"
import { shareUrl } from "@/lib/url-state"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { CityClockCard } from "./city-clock-card"
import { CitySelector } from "./city-selector"
import { ShareControls } from "./share-controls"

type CityComparisonProps = Pick<
  ReturnType<typeof useTimebridge>,
  | "state"
  | "reference"
  | "committedTime"
  | "draft"
  | "workDrafts"
  | "hourFormat"
  | "favorites"
  | "suggestedCityId"
  | "chooseCity"
  | "chooseReference"
  | "toggleFavorite"
  | "removeCity"
  | "moveCity"
>

export function CityComparison(controller: CityComparisonProps) {
  const t = useTranslations("Comparison")
  const cityName = useTranslations("Cities")
  const locale = useLocale()
  const formatLocalDate = useLocalDate()

  const [replaceId, setReplaceId] = useState<string>()

  const { state, reference, committedTime, draft, workDrafts } = controller
  const { cityIds, instant } = state

  const cityTimes = cityIds.flatMap((id) => {
    const city = citiesById.get(id)
    return city ? [{ city, clock: timezones.at(instant, city.zone) }] : []
  })

  const summary = cityTimes
    .map(({ city, clock }) => {
      return `${cityName(city.id)} · ${clock.time} (${clock.offset}) · ${formatLocalDate(clock.date)}`
    })
    .join("\n")

  const workPending = cityIds.some((id) => {
    return Boolean(workDrafts[id])
  })

  return (
    <section
      id="cidades"
      aria-labelledby="clock-title"
      className="mt-8 scroll-mt-6 border-t border-border pt-6 sm:mt-10 sm:pt-8"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="clock-title"
            className="text-2xl font-semibold tracking-tight sm:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <ShareControls
          summary={summary}
          link={shareUrl(window.location.origin, state, `/${locale}`)}
          disableSummary={Boolean(draft)}
          disableLink={Boolean(draft) || workPending}
        />
      </div>
      {draft && (
        <p
          role="status"
          className="mb-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
        >
          {t("draft")}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3">
        {cityTimes.map(({ city, clock }, index) => {
          return (
            <CityClockCard
              key={city.id}
              city={city}
              clock={clock}
              hourFormat={controller.hourFormat}
              referenceDate={committedTime.date}
              isReference={city.id === reference.id}
              isFavorite={controller.favorites.includes(city.id)}
              canRemove={cityIds.length > minimumCities}
              canMoveLeft={index > 0}
              canMoveRight={index < cityIds.length - 1}
              onReference={() => {
                controller.chooseReference(city.id)
              }}
              onFavorite={() => {
                controller.toggleFavorite(city.id)
              }}
              onReplace={() => {
                setReplaceId(city.id)
              }}
              onRemove={() => {
                controller.removeCity(city.id)

                if (replaceId === city.id) {
                  setReplaceId(undefined)
                }
              }}
              onMove={(direction) => {
                controller.moveCity(city.id, direction)
              }}
            />
          )
        })}
      </div>
      <div className="mt-3">
        <CitySelector
          key={replaceId ?? "add"}
          selectedIds={cityIds}
          favoriteIds={controller.favorites}
          suggestedId={controller.suggestedCityId}
          replacing={replaceId ? citiesById.get(replaceId) : undefined}
          onChoose={(id) => {
            controller.chooseCity(id, replaceId)
            setReplaceId(undefined)
          }}
        />
        {replaceId && (
          <Button
            type="button"
            variant="ghost"
            className="mt-1"
            onClick={() => {
              setReplaceId(undefined)
            }}
          >
            {t("cancel")}
          </Button>
        )}
      </div>
    </section>
  )
}
