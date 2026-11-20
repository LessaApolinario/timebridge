import { Button } from "@/components/ui/button"
import type { City } from "@/features/timezones/models/city"
import type { ZonedTime } from "@/features/timezones/models/time-conversion"
import { useLocalDate } from "@/i18n/use-local-date"
import { formatClock, type HourFormat } from "@/lib/clock-format"
import { useFormatter, useTranslations } from "next-intl"

interface ReferenceClockProps {
  city: City
  clock: ZonedTime
  instant: number
  isLive: boolean
  hourFormat: HourFormat
  onHourFormatChange: (format: HourFormat) => void
}

const hourFormats: HourFormat[] = [12, 24]

export function ReferenceClock({
  city,
  clock,
  instant,
  isLive,
  hourFormat,
  onHourFormatChange,
}: ReferenceClockProps) {
  const t = useTranslations("ReferenceClock")
  const cityName = useTranslations("Cities")
  const clockLabels = useTranslations("Clock")
  const { displayName } = useFormatter()
  const formatLocalDate = useLocalDate()

  const seconds = String(new Date(instant).getUTCSeconds()).padStart(2, "0")

  const { digits, period: meridiem } = formatClock(
    `${clock.time}:${seconds}`,
    hourFormat,
  )

  const period = meridiem && clockLabels(meridiem === "AM" ? "am" : "pm")

  return (
    <div className="@container">
      <div className="mb-4 flex sm:mb-6">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium">
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${isLive ? "bg-signal" : "bg-muted-foreground"}`}
          />
          {t(isLive ? "live" : "selected")}
        </p>
      </div>
      <time
        aria-label={t("timeLabel", {
          city: cityName(city.id),
          time: period ? `${digits} ${period}` : digits,
        })}
        dateTime={new Date(instant).toISOString()}
        className="flex items-baseline gap-1.5 whitespace-nowrap font-clock text-[clamp(1.75rem,26cqi,20rem)] font-semibold leading-[0.88] tracking-[-0.075em] tabular-nums sm:gap-3"
      >
        <span>{digits}</span>
        {period && (
          <>
            {" "}
            <span className="text-[max(0.7rem,0.095em)] leading-none font-semibold tracking-normal">
              {period}
            </span>
          </>
        )}
      </time>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mt-8">
        <div className="min-w-0">
          <p className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            {t.rich("location", {
              city: cityName(city.id),
              country: (chunks) => {
                return (
                  <span className="font-normal text-muted-foreground">
                    {chunks}
                  </span>
                )
              },
              countryName: displayName(city.countryCode, { type: "region" }),
            })}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span className="first-letter:uppercase">
              {formatLocalDate(clock.date)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">{clock.offset}</span>
          </p>
        </div>
        <fieldset className="flex shrink-0 rounded-full border border-border bg-background p-0.5">
          <legend className="sr-only">{t("clockFormat")}</legend>
          {hourFormats.map((format) => {
            return (
              <Button
                key={format}
                type="button"
                variant={hourFormat === format ? "default" : "ghost"}
                className="min-h-10 rounded-full px-3 text-xs sm:px-4 sm:text-sm"
                aria-pressed={hourFormat === format}
                onClick={() => {
                  onHourFormatChange(format)
                }}
              >
                {t("hourOption", { hours: format })}
              </Button>
            )
          })}
        </fieldset>
      </div>
    </div>
  )
}
