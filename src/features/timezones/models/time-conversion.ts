export const minuteMs = 60_000
export const dayMs = 24 * 60 * minuteMs
export const minimumDate = "1970-01-01"
export const maximumDate = "2099-12-31"

export interface LocalDateTime {
  date: string
  time: string
}

export interface ZonedTime extends LocalDateTime {
  offset: string
}

export type LocalTimeResolution =
  | { kind: "invalid" | "nonexistent" }
  | { kind: "unique" | "ambiguous"; instants: readonly number[] }

export interface InstantRange {
  start: number
  end: number
}
