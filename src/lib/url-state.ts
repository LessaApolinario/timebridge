import {
  defaultMeetingDuration,
  defaultWorkHours,
  type MeetingDuration,
  type WorkHours,
} from "@/features/meetings/models/meeting"
import { validWorkHours } from "@/features/meetings/services/availability-service"
import {
  citiesById,
  defaultCityIds,
  maximumCities,
  minimumCities,
} from "@/features/timezones/data/cities"
import { dayMs } from "@/features/timezones/models/time-conversion"

export interface Configuration {
  cityIds: string[]
  referenceId: string
  duration: MeetingDuration
  work: Record<string, WorkHours>
}

export interface ShareState extends Configuration {
  instant: number
}

const maxQueryLength = 1024
const minInstant = Date.UTC(1970, 0, 1) - dayMs
const maxInstant = Date.UTC(2100, 0, 1) + dayMs

export const defaultConfiguration: Configuration = {
  cityIds: defaultCityIds,
  referenceId: defaultCityIds[0],
  duration: defaultMeetingDuration,
  work: {},
}

export function isCityId(value: unknown): value is string {
  return typeof value === "string" && citiesById.has(value)
}

export function selectedCityIds(values: unknown[]) {
  const ids = [...new Set(values.filter(isCityId))].slice(0, maximumCities)

  return ids.length >= minimumCities ? ids : null
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isWorkHours(value: unknown): value is WorkHours {
  return (
    isRecord(value) &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    validWorkHours({ start: value.start, end: value.end })
  )
}

function parseInstant(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return null
  }

  const instant = Date.parse(value)

  if (
    !Number.isFinite(instant) ||
    instant < minInstant ||
    instant >= maxInstant ||
    new Date(instant).toISOString() !== value
  ) {
    return null
  }

  return instant
}

export function restoreShareState(
  query: string,
  fallback: ShareState,
): ShareState {
  if (query.length > maxQueryLength) {
    return fallback
  }

  const params = new URLSearchParams(query)
  const sharedCities = selectedCityIds(params.get("cities")?.split(",") ?? [])
  const cityIds = sharedCities ?? fallback.cityIds
  const requestedReference = params.get("ref")
  const referenceId =
    requestedReference && cityIds.includes(requestedReference)
      ? requestedReference
      : cityIds.includes(fallback.referenceId)
        ? fallback.referenceId
        : cityIds[0]
  const displayMinutes = params.get("minutes")
  const duration =
    displayMinutes === "30"
      ? 30
      : displayMinutes === "60"
        ? 60
        : fallback.duration
  const instant = parseInstant(params.get("at")) ?? fallback.instant
  const work: Configuration["work"] = { ...fallback.work }

  for (const entry of params.get("work")?.split(",").slice(0, maximumCities) ??
    []) {
    const [id, start, end, extra] = entry.split("~")
    const hours = { start, end }

    if (extra === undefined && cityIds.includes(id) && isWorkHours(hours)) {
      work[id] = hours
    }
  }

  return { cityIds, referenceId, duration, instant, work }
}

export function shareUrl(origin: string, state: ShareState) {
  const url = new URL("/", origin)
  const work = state.cityIds.map((id) => {
    const hours = state.work[id] ?? defaultWorkHours
    return `${id}~${hours.start}~${hours.end}`
  })

  url.search = new URLSearchParams({
    cities: state.cityIds.join(","),
    ref: state.referenceId,
    at: new Date(state.instant).toISOString(),
    minutes: String(state.duration),
    work: work.join(","),
  }).toString()

  return url.href
}
