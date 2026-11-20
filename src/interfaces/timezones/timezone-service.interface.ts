import type {
  InstantRange,
  LocalDateTime,
  LocalTimeResolution,
  ZonedTime,
} from "@/features/timezones/models/time-conversion"

export interface TimezoneService {
  at(instant: number, zone: string): ZonedTime
  resolve(local: LocalDateTime, zone: string): LocalTimeResolution
  civilDay(date: string, zone: string): readonly InstantRange[]
}
