import { cities, citiesById } from "@/features/timezones/data/cities"
import type { HourFormat } from "./clock-format"
import {
  defaultConfiguration,
  isCityId,
  isRecord,
  isWorkHours,
  selectedCityIds,
  type Configuration,
} from "./url-state"

export interface Preferences {
  configuration: Configuration
  favorites: string[]
  hourFormat?: HourFormat
}

const key = "timebridge.preferences.v1"
const emptyPreferences: Preferences = {
  configuration: defaultConfiguration,
  favorites: [],
  hourFormat: 24,
}

export function readPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem(key)

    if (!raw || raw.length > 8192) {
      return emptyPreferences
    }

    const saved: unknown = JSON.parse(raw)

    if (!isRecord(saved) || !isRecord(saved.configuration)) {
      return emptyPreferences
    }

    const { configuration } = saved
    const cityIds = Array.isArray(configuration.cityIds)
      ? (selectedCityIds(configuration.cityIds) ?? defaultConfiguration.cityIds)
      : defaultConfiguration.cityIds
    const referenceId =
      isCityId(configuration.referenceId) &&
      cityIds.includes(configuration.referenceId)
        ? configuration.referenceId
        : cityIds[0]
    const duration = configuration.duration === 60 ? 60 : 30
    const work: Configuration["work"] = {}

    if (isRecord(configuration.work)) {
      for (const id of citiesById.keys()) {
        const hours = configuration.work[id]

        if (isWorkHours(hours)) {
          work[id] = hours
        }
      }
    }

    const favorites = Array.isArray(saved.favorites)
      ? [...new Set(saved.favorites.filter(isCityId))]
      : []

    return {
      configuration: { cityIds, referenceId, duration, work },
      favorites,
      hourFormat: saved.hourFormat === 12 ? 12 : 24,
    }
  } catch {
    return emptyPreferences
  }
}

export function writePreferences(preferences: Preferences) {
  try {
    window.localStorage.setItem(key, JSON.stringify(preferences))
  } catch {
    // Preferences are optional when storage is blocked or full.
  }
}

export function browserCityId() {
  const browserZone = new Intl.DateTimeFormat().resolvedOptions().timeZone

  return cities.find((city) => {
    return (
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: city.zone,
      }).resolvedOptions().timeZone === browserZone
    )
  })?.id
}
