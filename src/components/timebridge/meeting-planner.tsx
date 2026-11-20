import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type {
  MeetingDuration,
  Participant,
  WorkHours,
} from "@/features/meetings/models/meeting"
import { validWorkHours } from "@/features/meetings/services/availability-service"
import type { City } from "@/features/timezones/models/city"
import { formatLocalDate } from "@/features/timezones/services/timezone-service"
import { availability, timezones } from "@/lib/di/container"
import { CalendarDays, Clock3 } from "lucide-react"
import { useMemo } from "react"
import { OverlapTimeline } from "./overlap-timeline"

interface MeetingPlannerProps {
  date: string
  reference: City
  participants: readonly Participant[]
  duration: MeetingDuration
  timePending: boolean
  onDurationChange: (duration: MeetingDuration) => void
  onWorkChange: (id: string, field: keyof WorkHours, value: string) => void
}

const durations: MeetingDuration[] = [30, 60]

export function MeetingPlanner({
  date,
  reference,
  participants,
  duration,
  timePending,
  onDurationChange,
  onWorkChange,
}: MeetingPlannerProps) {
  const result = useMemo(() => {
    return availability.calculate(date, reference.zone, participants, duration)
  }, [date, reference.zone, participants, duration])
  const invalidHours = participants.some(({ hours }) => {
    return !validWorkHours(hours)
  })
  const visibleResult = !timePending && !invalidHours && result.slots.length > 0

  return (
    <Card
      role="region"
      className="mt-9 gap-0 rounded-2xl border border-border p-4 ring-0 sm:p-6"
      aria-labelledby="planner-title"
      id="planejador"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-4">
        <div>
          <h2
            id="planner-title"
            className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          >
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />{" "}
            Planejador de reuniões
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Horários em {reference.name} · {formatLocalDate(date)}
          </p>
        </div>
        <fieldset className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          <legend className="sr-only">Duração da reunião</legend>
          {durations.map((option) => {
            return (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={duration === option ? "default" : "ghost"}
                aria-pressed={duration === option}
                onClick={() => {
                  onDurationChange(option)
                }}
              >
                {option} min
              </Button>
            )
          })}
        </fieldset>
      </div>
      <div className="mt-5">
        <h3 className="text-sm font-semibold">Jornadas locais</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {participants.map(({ city, hours }) => {
            const invalid = !validWorkHours(hours)
            const errorId = `work-error-${city.id}`

            return (
              <fieldset
                className="min-w-0 rounded-xl border border-border px-2.5 pb-2.5"
                key={city.id}
              >
                <legend className="px-1 text-xs font-semibold">
                  {city.name}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <Label className="grid gap-1 text-xs text-muted-foreground">
                    Início
                    <Input
                      type="text"
                      maxLength={5}
                      placeholder="HH:mm"
                      className="min-h-10 px-2 text-foreground tabular-nums"
                      value={hours.start}
                      aria-invalid={invalid}
                      aria-describedby={invalid ? errorId : undefined}
                      onChange={(event) => {
                        onWorkChange(city.id, "start", event.target.value)
                      }}
                    />
                  </Label>
                  <Label className="grid gap-1 text-xs text-muted-foreground">
                    Fim
                    <Input
                      type="text"
                      maxLength={5}
                      placeholder="HH:mm"
                      className="min-h-10 px-2 text-foreground tabular-nums"
                      value={hours.end}
                      aria-invalid={invalid}
                      aria-describedby={invalid ? errorId : undefined}
                      onChange={(event) => {
                        onWorkChange(city.id, "end", event.target.value)
                      }}
                    />
                  </Label>
                </div>
                {invalid && (
                  <p id={errorId} className="mt-2 text-xs text-destructive">
                    Use HH:mm com fim após o início no mesmo dia.
                  </p>
                )}
              </fieldset>
            )
          })}
        </div>
      </div>
      {visibleResult ? (
        <>
          <OverlapTimeline
            slots={result.slots}
            participants={participants}
            referenceZone={reference.zone}
          />
          <Separator className="mt-5" />
          <div className="pt-4">
            <h3
              className="flex items-center gap-2 text-sm font-semibold"
              id="meeting-suggestions"
            >
              <Clock3 aria-hidden="true" className="size-4 text-primary" />{" "}
              Sugestões para {duration} minutos
            </h3>
            {result.suggestions.length ? (
              <ul
                className="mt-2 flex flex-wrap gap-2"
                aria-labelledby="meeting-suggestions"
              >
                {result.suggestions.map(({ start, end }) => {
                  const from = timezones.at(start, reference.zone)
                  const to = timezones.at(end, reference.zone)
                  const crossesTransition = from.offset !== to.offset

                  return (
                    <li
                      key={start}
                      className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-accent-foreground tabular-nums"
                      title={`${from.offset} → ${to.offset}`}
                    >
                      {from.time}
                      {crossesTransition && ` (${from.offset})`}–{to.time}
                      {crossesTransition && ` (${to.offset})`}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p role="status" className="mt-2 text-sm text-muted-foreground">
                Nenhum horário em comum para {duration} minutos. Ajuste as
                jornadas, a data ou a duração.
              </p>
            )}
          </div>
        </>
      ) : (
        <p role="status" className="mt-5 text-sm text-muted-foreground">
          {timePending
            ? "Conclua a conversão para atualizar o planejador."
            : invalidHours
              ? "Ajuste as jornadas para comparar a disponibilidade."
              : "Não há intervalos disponíveis nessa data."}
        </p>
      )}
    </Card>
  )
}
