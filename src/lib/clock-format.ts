export type HourFormat = 12 | 24

export function formatClock(time: string, format: HourFormat) {
  if (format === 24) {
    return {
      digits: time,
      period: null,
    }
  }

  const hour = Number(time.slice(0, 2))
  const displayHour = String(hour % 12 || 12).padStart(2, "0")

  return {
    digits: `${displayHour}${time.slice(2)}`,
    period: hour < 12 ? "AM" : "PM",
  }
}
