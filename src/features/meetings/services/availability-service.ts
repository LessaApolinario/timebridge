import {
  minuteMs,
  type InstantRange,
} from "@/features/timezones/models/time-conversion"
import { clockMinute } from "@/features/timezones/services/timezone-service"
import type { AvailabilityService } from "@/interfaces/meetings/availability-service.interface"
import type { TimezoneService } from "@/interfaces/timezones/timezone-service.interface"
import type { AvailabilitySlot, WorkHours } from "../models/meeting"

const slotMs = 30 * minuteMs

function getWorkMinutes(hours: WorkHours) {
  const start = clockMinute(hours.start)
  const end = clockMinute(hours.end)

  if (start === null || end === null || start >= end) {
    return null
  }

  return { start, end }
}

export function validWorkHours(hours: WorkHours) {
  return getWorkMinutes(hours) !== null
}

export function createAvailabilityService(
  timezones: TimezoneService,
): AvailabilityService {
  return {
    calculate(date, referenceZone, participants, duration) {
      const slots: AvailabilitySlot[] = []
      const suggestions: InstantRange[] = []
      const schedules = participants.map(({ city, hours }) => {
        return { city, minutes: getWorkMinutes(hours) }
      })

      if (
        schedules.length < 2 ||
        schedules.some(({ minutes }) => {
          return minutes === null
        })
      ) {
        return { slots, suggestions }
      }

      for (const range of timezones.civilDay(date, referenceZone)) {
        for (let start = range.start; start < range.end; start += slotMs) {
          const end = Math.min(start + slotMs, range.end)
          const availableCityIds: string[] = []

          for (const { city, minutes } of schedules) {
            if (!minutes) {
              continue
            }

            let available = true

            for (let instant = start; instant < end; instant += minuteMs) {
              const local = clockMinute(timezones.at(instant, city.zone).time)

              if (
                local === null ||
                local < minutes.start ||
                local >= minutes.end
              ) {
                available = false
                break
              }
            }

            if (available) {
              availableCityIds.push(city.id)
            }
          }

          slots.push({
            start,
            end,
            availableCityIds,
            common: availableCityIds.length === schedules.length,
          })
        }
      }

      for (const [index, slot] of slots.entries()) {
        const end = slot.start + duration * minuteMs
        const next = slots[index + 1]
        const fits =
          slot.end >= end ||
          (next?.common && next.start === slot.end && next.end >= end)

        if (slot.common && fits) {
          suggestions.push({ start: slot.start, end })
        }
      }

      return { slots, suggestions }
    },
  }
}
