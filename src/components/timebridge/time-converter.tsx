import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { City } from "@/features/timezones/models/city"
import {
  maximumDate,
  minimumDate,
  type LocalDateTime,
  type LocalTimeResolution,
} from "@/features/timezones/models/time-conversion"
import { timezones } from "@/lib/di/container"
import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId } from "react"

interface TimeConverterProps {
  reference: City
  local: LocalDateTime
  resolution?: LocalTimeResolution
  onEdit: (field: keyof LocalDateTime, value: string) => void
  onChooseInstant: (instant: number) => void
  onNow: () => void
}

export function TimeConverter({
  reference,
  local,
  resolution,
  onEdit,
  onChooseInstant,
  onNow,
}: TimeConverterProps) {
  const t = useTranslations("Converter")
  const cityName = useTranslations("Cities")

  const dateId = useId()
  const timeId = useId()
  const validationId = useId()

  const ambiguous = resolution?.kind === "ambiguous"

  const invalid =
    resolution?.kind === "invalid" || resolution?.kind === "nonexistent"

  return (
    <div className="mt-5 rounded-2xl border border-border bg-card">
      <div className="grid gap-3 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <Label htmlFor={dateId} className="grid w-40 max-w-full gap-1">
            {t("date")}
            <Input
              id={dateId}
              type="date"
              min={minimumDate}
              max={maximumDate}
              className="min-h-10 bg-background tabular-nums"
              value={local.date}
              aria-invalid={invalid}
              aria-describedby={resolution ? validationId : undefined}
              onChange={(event) => {
                onEdit("date", event.target.value)
              }}
            />
          </Label>
          <Label htmlFor={timeId} className="grid gap-1">
            {t("time")}
            <Input
              id={timeId}
              type="text"
              maxLength={5}
              placeholder="HH:mm"
              className="min-h-10 w-24 bg-background tabular-nums"
              value={local.time}
              aria-invalid={invalid}
              aria-describedby={resolution ? validationId : undefined}
              onChange={(event) => {
                onEdit("time", event.target.value)
              }}
            />
          </Label>
          <Button
            type="button"
            variant="outline"
            className="min-h-10 rounded-full px-4"
            onClick={onNow}
          >
            <Clock aria-hidden="true" /> {t("now")}
          </Button>
        </div>
        {resolution?.kind === "invalid" && (
          <p
            role="alert"
            className="text-sm text-destructive"
            id={validationId}
          >
            {t("invalid")}
          </p>
        )}
        {resolution?.kind === "nonexistent" && (
          <p
            role="alert"
            className="text-sm text-destructive"
            id={validationId}
          >
            {t("nonexistent", { city: cityName(reference.id) })}
          </p>
        )}
        {ambiguous && (
          <fieldset
            className="flex flex-wrap gap-2"
            aria-describedby={validationId}
          >
            <legend id={validationId} className="mb-2 text-sm font-medium">
              {t("ambiguous", { city: cityName(reference.id) })}
            </legend>
            {resolution.instants.map((instant, index) => {
              const { offset } = timezones.at(instant, reference.zone)
              return (
                <Button
                  key={instant}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onChooseInstant(instant)
                  }}
                >
                  {t("occurrence", { index: index + 1, offset })}
                </Button>
              )
            })}
          </fieldset>
        )}
      </div>
    </div>
  )
}
