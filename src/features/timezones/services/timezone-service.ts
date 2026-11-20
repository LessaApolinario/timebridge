import type { TimezoneService } from "@/interfaces/timezones/timezone-service.interface"
import {
  dayMs,
  maximumDate,
  minimumDate,
  minuteMs,
  type InstantRange,
  type LocalDateTime,
  type LocalTimeResolution,
  type ZonedTime,
} from "../models/time-conversion"

const formatters = new Map<string, Intl.DateTimeFormat>()
const recentDays = new Map<string, CivilDay>()
const maxCachedDays = 8
const zoneSearchMargin = 16 * 60 * minuteMs

interface CivilDay {
  ranges: InstantRange[]
  instantsByTime: Map<string, number[]>
}

function formatterFor(zone: string) {
  const cached = formatters.get(zone)

  if (cached) {
    return cached
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    calendar: "iso8601",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })

  formatters.set(zone, formatter)
  return formatter
}

export function clockMinute(time: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null
  }

  return Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
}

function civilDateTimestamp(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  const timestamp = Date.parse(`${date}T00:00:00Z`)

  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== date
  ) {
    return null
  }

  return timestamp
}

function localDateTime(instant: number, zone: string): LocalDateTime {
  const values: Record<string, string> = {}

  for (const part of formatterFor(zone).formatToParts(instant)) {
    values[part.type] = part.value
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  }
}

function utcOffset(instant: number, local: LocalDateTime) {
  const localAsUtc = Date.parse(`${local.date}T${local.time}:00Z`)
  const offset = localAsUtc / minuteMs - Math.floor(instant / minuteMs)
  const absolute = Math.abs(offset)
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0")
  const minutes = String(absolute % 60).padStart(2, "0")

  return `UTC${offset < 0 ? "−" : "+"}${hours}:${minutes}`
}

function at(instant: number, zone: string): ZonedTime {
  const local = localDateTime(instant, zone)

  return { ...local, offset: utcOffset(instant, local) }
}

function findCivilDay(date: string, zone: string): CivilDay {
  const day = {
    ranges: [],
    instantsByTime: new Map<string, number[]>(),
  } satisfies CivilDay
  const utcMidnight = civilDateTimestamp(date)

  if (utcMidnight === null) {
    return day
  }

  const ranges: InstantRange[] = day.ranges
  // Catalog zones use whole-minute offsets in the supported date range.
  // Walking real minutes retains both occurrences of a repeated civil time.
  for (
    let instant = utcMidnight - zoneSearchMargin;
    instant < utcMidnight + dayMs + zoneSearchMargin;
    instant += minuteMs
  ) {
    const local = localDateTime(instant, zone)

    if (local.date !== date) {
      continue
    }

    const previousRange = ranges[ranges.length - 1]

    if (previousRange?.end === instant) {
      previousRange.end += minuteMs
    } else {
      ranges.push({ start: instant, end: instant + minuteMs })
    }

    const matchingInstants = day.instantsByTime.get(local.time) ?? []
    matchingInstants.push(instant)
    day.instantsByTime.set(local.time, matchingInstants)
  }

  return day
}

function getCivilDay(date: string, zone: string) {
  const key = `${zone}/${date}`
  const cached = recentDays.get(key)

  if (cached) {
    return cached
  }

  const day = findCivilDay(date, zone)

  if (recentDays.size >= maxCachedDays) {
    const oldestKey = recentDays.keys().next().value

    if (oldestKey !== undefined) {
      recentDays.delete(oldestKey)
    }
  }

  recentDays.set(key, day)
  return day
}

function resolve(local: LocalDateTime, zone: string): LocalTimeResolution {
  if (
    local.date < minimumDate ||
    local.date > maximumDate ||
    civilDateTimestamp(local.date) === null ||
    clockMinute(local.time) === null
  ) {
    return { kind: "invalid" }
  }

  const instants = getCivilDay(local.date, zone).instantsByTime.get(local.time)

  if (!instants) {
    return { kind: "nonexistent" }
  }

  return { kind: instants.length === 1 ? "unique" : "ambiguous", instants }
}

export function localDayDifference(date: string, referenceDate: string) {
  return (
    (Date.parse(`${date}T00:00:00Z`) -
      Date.parse(`${referenceDate}T00:00:00Z`)) /
    dayMs
  )
}

export const timezoneService: TimezoneService = {
  at,
  resolve,
  civilDay(date, zone) {
    return getCivilDay(date, zone).ranges
  },
}
