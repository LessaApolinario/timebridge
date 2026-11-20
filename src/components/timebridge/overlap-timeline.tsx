import type {
  AvailabilitySlot,
  Participant,
} from "@/features/meetings/models/meeting"
import { timezones } from "@/lib/di/container"
import { useTranslations } from "next-intl"
import { useId } from "react"

interface OverlapTimelineProps {
  slots: readonly AvailabilitySlot[]
  participants: readonly Participant[]
  referenceZone: string
}

const slotClass =
  "inline-flex h-5 min-w-3.5 items-center justify-center rounded-sm px-0.5 text-[0.65rem] font-semibold"

const slotColors = {
  common: "bg-primary text-primary-foreground",
  working: "bg-accent text-accent-foreground",
  unavailable: "bg-muted text-muted-foreground",
}

export function OverlapTimeline({
  slots,
  participants,
  referenceZone,
}: OverlapTimelineProps) {
  const t = useTranslations("Timeline")
  const cityName = useTranslations("Cities")
  const headingId = useId()

  const headings = slots.map(({ start, end }) => {
    const local = timezones.at(start, referenceZone)
    const finish = timezones.at(end, referenceZone)

    return {
      ...local,
      label: t("range", {
        start: local.time,
        startOffset: local.offset,
        end: finish.time,
        endOffset: finish.offset,
      }),
    }
  })

  return (
    <div className="mt-5">
      <h3 id={headingId} className="text-sm font-semibold">
        {t("title")}
      </h3>
      <ul
        className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"
        aria-label={t("legend")}
      >
        <li>
          <span
            className={`${slotClass} ${slotColors.common} mr-1`}
            aria-hidden="true"
          >
            ✓
          </span>{" "}
          {t("common")}
        </li>
        <li>
          <span
            className={`${slotClass} ${slotColors.working} mr-1`}
            aria-hidden="true"
          >
            •
          </span>{" "}
          {t("working")}
        </li>
        <li>
          <span
            className={`${slotClass} ${slotColors.unavailable} mr-1`}
            aria-hidden="true"
          >
            –
          </span>{" "}
          {t("unavailable")}
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
          <caption className="sr-only">{t("caption")}</caption>
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
                {t("city")}
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
                    {cityName(city.id)}
                  </th>
                  {slots.map((slot, index) => {
                    const working = slot.availableCityIds.includes(city.id)
                    const status = slot.common
                      ? t("common")
                      : working
                        ? t("working")
                        : t("unavailable")
                    const style = slot.common
                      ? slotColors.common
                      : working
                        ? slotColors.working
                        : slotColors.unavailable
                    const symbol = slot.common ? "✓" : working ? "•" : "–"

                    return (
                      <td
                        key={slot.start}
                        className="p-0"
                        title={`${headings[index].label} · ${status}`}
                      >
                        <span
                          className={`${slotClass} w-full ${style}`}
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
