import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { City } from "@/features/timezones/models/city"
import type { ZonedTime } from "@/features/timezones/models/time-conversion"
import {
  formatLocalDate,
  localDayDifference,
} from "@/features/timezones/services/timezone-service"
import {
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  MapPin,
  Star,
  X,
} from "lucide-react"

interface CityClockCardProps {
  city: City
  clock: ZonedTime
  referenceDate: string
  isReference: boolean
  isFavorite: boolean
  canRemove: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  onReference: () => void
  onFavorite: () => void
  onReplace: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

function dayChangeLabel(days: number) {
  if (days === -1) {
    return "Dia anterior"
  }

  if (days === 1) {
    return "Dia seguinte"
  }

  return days ? `${Math.abs(days)} dias ${days < 0 ? "antes" : "depois"}` : null
}

export function CityClockCard({
  city,
  clock,
  referenceDate,
  isReference,
  isFavorite,
  canRemove,
  canMoveLeft,
  canMoveRight,
  onReference,
  onFavorite,
  onReplace,
  onRemove,
  onMove,
}: CityClockCardProps) {
  const dayChange = dayChangeLabel(
    localDayDifference(clock.date, referenceDate),
  )

  return (
    <Card
      role="article"
      className={`min-w-0 gap-0 rounded-2xl border p-4 ring-0 sm:p-5 ${isReference ? "border-primary/40 bg-accent/65" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg leading-tight font-semibold">{city.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin aria-hidden="true" className="size-3.5" /> {city.country}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Favoritar ${city.name}`}
          aria-pressed={isFavorite}
          onClick={onFavorite}
        >
          <Star
            aria-hidden="true"
            className={isFavorite ? "fill-current text-primary" : ""}
          />
        </Button>
      </div>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <time
          dateTime={`${clock.date}T${clock.time}`}
          className="text-[clamp(2.4rem,5vw,4rem)] leading-none font-semibold tracking-[-0.075em] tabular-nums"
        >
          {clock.time}
        </time>
        <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
          {clock.offset}
        </span>
      </div>
      <p className="mt-2 text-sm first-letter:uppercase">
        {formatLocalDate(clock.date)}
      </p>
      <p className="mt-1 text-xs break-all text-muted-foreground">
        {city.zone}
      </p>
      {dayChange && (
        <Badge variant="secondary" className="mt-2 rounded-md">
          {dayChange}
        </Badge>
      )}
      <div className="mt-auto pt-4">
        {isReference ? (
          <Badge className="mb-2 min-h-7 rounded-md">Referência</Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-2"
            onClick={onReference}
            aria-label={`Usar ${city.name} como referência`}
          >
            Usar como referência
          </Button>
        )}
        <Separator />
        <div className="flex flex-wrap gap-0.5 pt-1.5">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={!canMoveLeft}
            aria-label={`Mover ${city.name} para antes`}
            onClick={() => {
              onMove(-1)
            }}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={!canMoveRight}
            aria-label={`Mover ${city.name} para depois`}
            onClick={() => {
              onMove(1)
            }}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={`Trocar ${city.name}`}
            onClick={onReplace}
          >
            <ArrowRightLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={!canRemove}
            aria-label={`Remover ${city.name}`}
            onClick={onRemove}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
