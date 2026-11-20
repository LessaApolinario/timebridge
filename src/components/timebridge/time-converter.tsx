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
import { useId } from "react"

interface TimeConverterProps {
  reference: City
  local: LocalDateTime
  resolution?: LocalTimeResolution
  onEdit: (field: keyof LocalDateTime, value: string) => void
  onChooseInstant: (instant: number) => void
}

export function TimeConverter({
  reference,
  local,
  resolution,
  onEdit,
  onChooseInstant,
}: TimeConverterProps) {
  const dateId = useId()
  const timeId = useId()
  const validationId = useId()
  const ambiguous = resolution?.kind === "ambiguous"
  const invalid =
    resolution?.kind === "invalid" || resolution?.kind === "nonexistent"

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="mr-auto min-w-36 self-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Cidade de referência
            </p>
            <p className="text-lg font-semibold">{reference.name}</p>
          </div>
          <Label htmlFor={dateId} className="grid gap-1">
            Data
            <Input
              id={dateId}
              type="date"
              min={minimumDate}
              max={maximumDate}
              className="min-h-10"
              value={local.date}
              aria-invalid={invalid}
              aria-describedby={resolution ? validationId : undefined}
              onChange={(event) => {
                onEdit("date", event.target.value)
              }}
            />
          </Label>
          <Label htmlFor={timeId} className="grid gap-1">
            Hora (24 h)
            <Input
              id={timeId}
              type="text"
              maxLength={5}
              placeholder="HH:mm"
              className="min-h-10 w-25 tabular-nums"
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
            className="min-h-10"
            onClick={() => {
              onChooseInstant(Date.now())
            }}
          >
            <Clock aria-hidden="true" /> Agora
          </Button>
        </div>
        {resolution?.kind === "invalid" && (
          <p
            role="alert"
            className="text-sm text-destructive"
            id={validationId}
          >
            Informe uma data entre 1970 e 2099 e um horário no formato HH:mm.
          </p>
        )}
        {resolution?.kind === "nonexistent" && (
          <p
            role="alert"
            className="text-sm text-destructive"
            id={validationId}
          >
            Esse horário não existe em {reference.name} nessa data devido a uma
            mudança de fuso. Escolha outro horário.
          </p>
        )}
        {ambiguous && (
          <fieldset
            className="flex flex-wrap gap-2"
            aria-describedby={validationId}
          >
            <legend id={validationId} className="mb-2 text-sm font-medium">
              Esse horário ocorre duas vezes em {reference.name}. Escolha a
              ocorrência.
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
                  {index + 1}ª ocorrência · {offset}
                </Button>
              )
            })}
          </fieldset>
        )}
      </div>
    </div>
  )
}
