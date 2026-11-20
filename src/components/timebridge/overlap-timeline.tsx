import type {
  AvailabilitySlot,
  Participant,
} from "@/features/meetings/models/meeting"
import { timezones } from "@/lib/di/container"
import { useId } from "react"

interface OverlapTimelineProps {
  slots: readonly AvailabilitySlot[]
  participants: readonly Participant[]
  referenceZone: string
}

export function OverlapTimeline({
  slots,
  participants,
  referenceZone,
}: OverlapTimelineProps) {
  const headingId = useId()

  const headings = slots.map(({ start, end }) => {
    const local = timezones.at(start, referenceZone)
    const finish = timezones.at(end, referenceZone)

    return {
      ...local,
      label: `${local.time} (${local.offset}) a ${finish.time} (${finish.offset})`,
    }
  })

  return (
    <div className="mt-5">
      <h3 id={headingId} className="text-sm font-semibold">
        Disponibilidade ao longo do dia
      </h3>
      <ul
        className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
        aria-label="Legenda da disponibilidade"
      >
        <li>
          <span className="tb-slot tb-common mr-1" aria-hidden="true">
            ✓
          </span>{" "}
          Horário comum
        </li>
        <li>
          <span className="tb-slot tb-work mr-1" aria-hidden="true">
            •
          </span>{" "}
          Dentro da jornada
        </li>
        <li>
          <span className="tb-slot mr-1" aria-hidden="true">
            –
          </span>{" "}
          Fora da jornada
        </li>
      </ul>
      <div
        className="relative mt-3 overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-primary"
        tabIndex={0}
        role="region"
        aria-labelledby={headingId}
      >
        <table
          className="w-full table-fixed border-separate border-spacing-0.5 text-xs"
          style={{ minWidth: 112 + slots.length * 17 }}
        >
          <caption className="sr-only">
            Disponibilidade em intervalos de até 30 minutos, no fuso da
            referência
          </caption>
          <colgroup>
            <col className="w-28" />
            <col span={slots.length} />
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-card px-2 py-2 text-left font-medium text-muted-foreground"
              >
                Cidade
              </th>
              {headings.map(({ time, label }, index) => {
                return (
                  <th
                    key={slots[index].start}
                    scope="col"
                    className="relative h-7 text-left font-medium text-muted-foreground"
                    title={label}
                  >
                    <span className="sr-only">{label}</span>
                    {index % 6 === 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 left-0 text-[0.64rem] tabular-nums"
                      >
                        {time}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {participants.map(({ city }) => {
              return (
                <tr key={city.id}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-medium"
                  >
                    {city.name}
                  </th>
                  {slots.map((slot, index) => {
                    const working = slot.availableCityIds.includes(city.id)
                    const status = slot.common
                      ? "Horário comum"
                      : working
                        ? "Dentro da jornada"
                        : "Fora da jornada"
                    const style = slot.common
                      ? "tb-common"
                      : working
                        ? "tb-work"
                        : ""
                    const symbol = slot.common ? "✓" : working ? "•" : "–"

                    return (
                      <td
                        key={slot.start}
                        className="p-0"
                        title={`${headings[index].label} · ${status}`}
                      >
                        <span
                          className={`tb-slot w-full ${style}`}
                          aria-hidden="true"
                        >
                          {symbol}
                        </span>
                        <span className="sr-only">{status}</span>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
