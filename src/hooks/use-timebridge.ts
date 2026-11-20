import {
  defaultWorkHours,
  type MeetingDuration,
  type WorkHours,
} from "@/features/meetings/models/meeting"
import { validWorkHours } from "@/features/meetings/services/availability-service"
import {
  citiesById,
  maximumCities,
  minimumCities,
} from "@/features/timezones/data/cities"
import type {
  LocalDateTime,
  LocalTimeResolution,
} from "@/features/timezones/models/time-conversion"
import type { HourFormat } from "@/lib/clock-format"
import { timezones } from "@/lib/di/container"
import {
  browserCityId,
  readPreferences,
  writePreferences,
} from "@/lib/local-preferences"
import {
  hasSharedInstant,
  isCityId,
  restoreShareState,
  type ShareState,
} from "@/lib/url-state"
import { useEffect, useState } from "react"

interface TimeDraft {
  local: LocalDateTime
  resolution: LocalTimeResolution
}

function readInitialState() {
  const preferences = readPreferences()
  const query = window.location.search
  const state = restoreShareState(query, {
    ...preferences.configuration,
    instant: Date.now(),
  })

  return {
    state,
    isLive: !hasSharedInstant(query),
    hourFormat: preferences.hourFormat ?? 24,
    favorites: preferences.favorites,
    suggestedCityId: browserCityId(),
  }
}

export function useTimebridge() {
  const [initial] = useState(readInitialState)
  const [state, setState] = useState(initial.state)
  const [isLive, setIsLive] = useState(initial.isLive)
  const [hourFormat, setHourFormat] = useState<HourFormat>(initial.hourFormat)
  const [favorites, setFavorites] = useState(initial.favorites)
  const [draft, setDraft] = useState<TimeDraft | null>(null)
  const [workDrafts, setWorkDrafts] = useState<Record<string, WorkHours>>({})
  const [preferencesChanged, setPreferencesChanged] = useState(false)

  const reference = citiesById.get(state.referenceId)!
  const committedTime = timezones.at(state.instant, reference.zone)
  const local = draft?.local ?? committedTime
  const { cityIds, referenceId, duration, work } = state

  useEffect(() => {
    if (!isLive) {
      return
    }

    let timeout: number

    function scheduleTick() {
      const delay = 1_000 - (Date.now() % 1_000)

      timeout = window.setTimeout(() => {
        const instant = Date.now()

        setState((current) => {
          return { ...current, instant }
        })
        scheduleTick()
      }, delay)
    }

    scheduleTick()
    return () => {
      window.clearTimeout(timeout)
    }
  }, [isLive])

  useEffect(() => {
    if (preferencesChanged) {
      writePreferences({
        configuration: { cityIds, referenceId, duration, work },
        favorites,
        hourFormat,
      })
    }
  }, [
    cityIds,
    referenceId,
    duration,
    work,
    favorites,
    hourFormat,
    preferencesChanged,
  ])

  function commitInstant(instant: number) {
    setDraft(null)
    setState((current) => {
      return { ...current, instant }
    })
  }

  function goLive() {
    commitInstant(Date.now())
    setIsLive(true)
  }

  function chooseHourFormat(format: HourFormat) {
    setPreferencesChanged(true)
    setHourFormat(format)
  }

  function updateLocal(field: keyof LocalDateTime, value: string) {
    setIsLive(false)
    const next = { date: local.date, time: local.time, [field]: value }
    const resolution = timezones.resolve(next, reference.zone)

    if (resolution.kind === "unique") {
      commitInstant(resolution.instants[0])
      return
    }

    setDraft({ local: next, resolution })
  }

  function updateConfiguration(update: (current: ShareState) => ShareState) {
    setPreferencesChanged(true)
    setState(update)
  }

  function chooseCity(id: string, replacing?: string) {
    if (
      !isCityId(id) ||
      cityIds.includes(id) ||
      (replacing
        ? !cityIds.includes(replacing)
        : cityIds.length >= maximumCities)
    ) {
      return
    }

    if (replacing === referenceId) {
      setDraft(null)
    }

    updateConfiguration((current) => {
      const ids = replacing
        ? current.cityIds.map((cityId) => {
            return cityId === replacing ? id : cityId
          })
        : [...current.cityIds, id]

      return {
        ...current,
        cityIds: ids,
        referenceId:
          current.referenceId === replacing ? id : current.referenceId,
      }
    })
  }

  function removeCity(id: string) {
    if (cityIds.length <= minimumCities || !cityIds.includes(id)) {
      return
    }

    if (id === referenceId) {
      setDraft(null)
    }

    updateConfiguration((current) => {
      const ids = current.cityIds.filter((cityId) => {
        return cityId !== id
      })
      return {
        ...current,
        cityIds: ids,
        referenceId: id === current.referenceId ? ids[0] : current.referenceId,
      }
    })
  }

  function moveCity(id: string, direction: -1 | 1) {
    updateConfiguration((current) => {
      const index = current.cityIds.indexOf(id)
      const target = index + direction

      if (index < 0 || target < 0 || target >= current.cityIds.length) {
        return current
      }

      const ids = [...current.cityIds]
      ids.splice(index, 1)
      ids.splice(target, 0, id)

      return { ...current, cityIds: ids }
    })
  }

  function chooseReference(id: string) {
    if (id === referenceId || !cityIds.includes(id)) {
      return
    }

    setDraft(null)
    updateConfiguration((current) => {
      return { ...current, referenceId: id }
    })
  }

  function toggleFavorite(id: string) {
    setPreferencesChanged(true)
    setFavorites((current) => {
      return current.includes(id)
        ? current.filter((favorite) => {
            return favorite !== id
          })
        : [...current, id]
    })
  }

  function chooseDuration(duration: MeetingDuration) {
    updateConfiguration((current) => {
      return { ...current, duration }
    })
  }

  function updateWork(id: string, field: keyof WorkHours, value: string) {
    const hours = {
      ...(workDrafts[id] ?? work[id] ?? defaultWorkHours),
      [field]: value,
    }

    setWorkDrafts((current) => {
      const next = { ...current }

      if (validWorkHours(hours)) {
        delete next[id]
      } else {
        next[id] = hours
      }

      return next
    })

    if (validWorkHours(hours)) {
      updateConfiguration((current) => {
        return { ...current, work: { ...current.work, [id]: hours } }
      })
    }
  }

  return {
    state,
    isLive,
    hourFormat,
    reference,
    committedTime,
    local,
    draft,
    favorites,
    workDrafts,
    suggestedCityId: initial.suggestedCityId,
    commitInstant,
    goLive,
    chooseHourFormat,
    updateLocal,
    chooseCity,
    removeCity,
    moveCity,
    chooseReference,
    toggleFavorite,
    chooseDuration,
    updateWork,
  }
}
