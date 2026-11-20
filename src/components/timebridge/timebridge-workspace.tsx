import { Button } from "@/components/ui/button"
import { defaultWorkHours } from "@/features/meetings/models/meeting"
import { citiesById, minimumCities } from "@/features/timezones/data/cities"
import { formatLocalDate } from "@/features/timezones/services/timezone-service"
import { useTimebridge } from "@/hooks/use-timebridge"
import { timezones } from "@/lib/di/container"
import { shareUrl } from "@/lib/url-state"
import { useMemo, useState } from "react"
import { CityClockCard } from "./city-clock-card"
import { CitySelector } from "./city-selector"
import { MeetingPlanner } from "./meeting-planner"
import { ShareControls } from "./share-controls"
import { TimeConverter } from "./time-converter"

export function TimebridgeWorkspace() {
  const controller = useTimebridge()

  const [replaceId, setReplaceId] = useState<string>()

  const { state, reference, committedTime, local, draft, workDrafts } =
    controller

  const { cityIds, instant, work } = state

  const participants = useMemo(() => {
    return cityIds.flatMap((id) => {
      const city = citiesById.get(id)
      return city
        ? [{ city, hours: workDrafts[id] ?? work[id] ?? defaultWorkHours }]
        : []
    })
  }, [cityIds, work, workDrafts])

  const cityTimes = participants.map(({ city }) => {
    return { city, clock: timezones.at(instant, city.zone) }
  })

  const summary = cityTimes
    .map(({ city, clock }) => {
      return `${city.name} · ${clock.time} (${clock.offset}) · ${formatLocalDate(clock.date)}`
    })
    .join("\n")

  const workPending = cityIds.some((id) => {
    return Boolean(workDrafts[id])
  })

  return (
    <div id="comparador">
      <TimeConverter
        reference={reference}
        local={local}
        resolution={draft?.resolution}
        onEdit={controller.updateLocal}
        onChooseInstant={controller.commitInstant}
      />
      <div className="mx-auto max-w-7xl px-4 pt-7 pb-10 sm:px-6 lg:px-8">
        <section aria-labelledby="clock-title">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="clock-title"
                className="text-xl font-semibold tracking-tight"
              >
                Horários locais
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare de 2 a 5 cidades ao mesmo tempo.
              </p>
            </div>
            <ShareControls
              summary={summary}
              link={shareUrl(window.location.origin, state)}
              disableSummary={Boolean(draft)}
              disableLink={Boolean(draft) || workPending}
            />
          </div>
          {draft && (
            <p
              role="status"
              className="mb-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              Os cartões ainda mostram o último horário confirmado.
            </p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3">
            {cityTimes.map(({ city, clock }, index) => {
              return (
                <CityClockCard
                  key={city.id}
                  city={city}
                  clock={clock}
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
                Cancelar troca
              </Button>
            )}
          </div>
        </section>
        <MeetingPlanner
          date={committedTime.date}
          reference={reference}
          participants={participants}
          duration={state.duration}
          timePending={Boolean(draft)}
          onDurationChange={controller.chooseDuration}
          onWorkChange={controller.updateWork}
        />
      </div>
    </div>
  )
}
