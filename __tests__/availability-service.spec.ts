import {
  defaultWorkHours,
  type Participant,
} from "@/features/meetings/models/meeting"
import { citiesById } from "@/features/timezones/data/cities"
import { availability } from "@/lib/di/container"

const date = "2025-01-15"
const referenceZone = "America/Sao_Paulo"

function participant(id: string, hours = defaultWorkHours): Participant {
  const city = citiesById.get(id)

  if (!city) {
    throw new Error(`Unknown city: ${id}`)
  }

  return { city, hours }
}

describe("availability", () => {
  const saoPaulo = participant("sao-paulo")
  const newYork = participant("new-york")
  const london = participant("london")

  it("should narrow the common window when a third zone joins", () => {
    const two = availability.calculate(
      date,
      referenceZone,
      [saoPaulo, newYork],
      30,
    )
    const three = availability.calculate(
      date,
      referenceZone,
      [saoPaulo, newYork, london],
      30,
    )

    expect(two.slots).toHaveLength(48)
    expect(two.suggestions).toHaveLength(14)
    expect(three.suggestions).toHaveLength(8)
    expect(three.suggestions[0].start).toBe(Date.UTC(2025, 0, 15, 14))
    expect(three.suggestions.at(-1)?.end).toBe(Date.UTC(2025, 0, 15, 18))
  })

  it("should recommend only starts with a full hour of common availability", () => {
    const result = availability.calculate(
      date,
      referenceZone,
      [saoPaulo, newYork, london],
      60,
    )

    expect(result.suggestions).toHaveLength(7)
    expect(result.suggestions.at(-1)).toEqual({
      start: Date.UTC(2025, 0, 15, 17),
      end: Date.UTC(2025, 0, 15, 18),
    })
  })

  it("should remove a slot when a participant becomes unavailable before its end", () => {
    const earlyFinish = participant("london", { start: "09:00", end: "17:59" })
    const result = availability.calculate(
      date,
      referenceZone,
      [saoPaulo, newYork, earlyFinish],
      30,
    )

    expect(result.suggestions.at(-1)?.end).toBe(Date.UTC(2025, 0, 15, 17, 30))
  })

  it("should return no suggestions for nonoverlapping journeys or overnight schedules", () => {
    const daytime = participant("london", { start: "09:00", end: "10:00" })
    const overnight = participant("london", { start: "22:00", end: "06:00" })
    const noOverlap = availability.calculate(
      date,
      referenceZone,
      [saoPaulo, daytime],
      30,
    )

    expect(noOverlap.slots).toHaveLength(48)
    expect(noOverlap.suggestions).toEqual([])
    expect(
      availability.calculate(date, referenceZone, [saoPaulo, overnight], 30),
    ).toEqual({
      slots: [],
      suggestions: [],
    })
  })

  it("should keep slots continuous in UTC across short and long DST days", () => {
    const shortDay = availability.calculate(
      "2025-03-09",
      newYork.city.zone,
      [newYork, london],
      30,
    )
    const longDay = availability.calculate(
      "2025-11-02",
      newYork.city.zone,
      [newYork, london],
      60,
    )

    expect(shortDay.slots).toHaveLength(46)
    expect(longDay.slots).toHaveLength(50)
    expect(longDay.slots[0].start).toBe(Date.UTC(2025, 10, 2, 4))
    expect(longDay.slots.at(-1)?.end).toBe(Date.UTC(2025, 10, 3, 5))
    expect(
      longDay.slots.every((slot, index) => {
        return !index || slot.start === longDay.slots[index - 1].end
      }),
    ).toBe(true)
  })

  it("should include a participant working on the next local day", () => {
    const evening = participant("sao-paulo", { start: "20:00", end: "21:00" })
    const shanghai = participant("shanghai", { start: "07:00", end: "08:00" })
    const result = availability.calculate(
      date,
      referenceZone,
      [evening, shanghai],
      60,
    )

    expect(result.suggestions).toEqual([
      {
        start: Date.UTC(2025, 0, 15, 23),
        end: Date.UTC(2025, 0, 16, 0),
      },
    ])
  })
})
