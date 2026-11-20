import { defaultWorkHours } from "@/features/meetings/models/meeting"
import { citiesById } from "@/features/timezones/data/cities"
import { useTimebridge } from "@/hooks/use-timebridge"
import { useMemo } from "react"
import { CityComparison } from "./city-comparison"
import { MeetingPlanner } from "./meeting-planner"
import { ReferenceClock } from "./reference-clock"
import { TimeConverter } from "./time-converter"

export function TimebridgeWorkspace() {
  const controller = useTimebridge()

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

  return (
    <div id="comparador" className="mt-3 min-w-0">
      <section aria-labelledby="page-title">
        <ReferenceClock
          city={reference}
          clock={committedTime}
          instant={instant}
          isLive={controller.isLive}
          hourFormat={controller.hourFormat}
          onHourFormatChange={controller.chooseHourFormat}
        />
        <TimeConverter
          reference={reference}
          local={local}
          resolution={draft?.resolution}
          onEdit={controller.updateLocal}
          onChooseInstant={controller.commitInstant}
          onNow={controller.goLive}
        />
      </section>
      <CityComparison {...controller} />
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
  )
}
