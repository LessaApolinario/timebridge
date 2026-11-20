import type { City } from "@/features/timezones/models/city"
import type { InstantRange } from "@/features/timezones/models/time-conversion"

export type MeetingDuration = 30 | 60

export interface WorkHours {
  start: string
  end: string
}

export interface Participant {
  city: City
  hours: WorkHours
}

export interface AvailabilitySlot extends InstantRange {
  availableCityIds: readonly string[]
  common: boolean
}

export interface MeetingAvailability {
  slots: readonly AvailabilitySlot[]
  suggestions: readonly InstantRange[]
}

export const defaultWorkHours: WorkHours = {
  start: "09:00",
  end: "18:00",
}

export const defaultMeetingDuration: MeetingDuration = 30
