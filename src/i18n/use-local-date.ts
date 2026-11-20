import { useFormatter } from "next-intl"

export function useLocalDate() {
  const { dateTime } = useFormatter()

  return (date: string) => {
    return dateTime(new Date(`${date}T00:00:00Z`), {
      dateStyle: "full",
      timeZone: "UTC",
    })
  }
}
