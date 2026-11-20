import {
  localDayDifference,
  timezoneService,
} from "@/features/timezones/services/timezone-service"

const saoPaulo = "America/Sao_Paulo"
const newYork = "America/New_York"
const london = "Europe/London"
const shanghai = "Asia/Shanghai"

describe("timezoneService", () => {
  it.each([
    [saoPaulo, "10:00", "UTC−03:00"],
    [newYork, "08:00", "UTC−05:00"],
    [london, "13:00", "UTC+00:00"],
    [shanghai, "21:00", "UTC+08:00"],
  ])("should convert the same instant in %s", (zone, time, offset) => {
    expect(timezoneService.at(Date.UTC(2025, 0, 15, 13), zone)).toEqual({
      date: "2025-01-15",
      time,
      offset,
    })
  })

  it("should report the previous and next dates across midnight", () => {
    const instant = Date.UTC(2025, 0, 16, 2)
    const reference = timezoneService.at(instant, london)
    const previous = timezoneService.at(instant, saoPaulo)
    const next = timezoneService.at(Date.UTC(2025, 0, 16, 20), shanghai)

    expect(previous).toMatchObject({ date: "2025-01-15", time: "23:00" })
    expect(localDayDifference(previous.date, reference.date)).toBe(-1)
    expect(next).toMatchObject({ date: "2025-01-17", time: "04:00" })
    expect(localDayDifference(next.date, reference.date)).toBe(1)
  })

  it.each([
    [newYork, "UTC−05:00", "UTC−04:00"],
    [london, "UTC+00:00", "UTC+01:00"],
    [shanghai, "UTC+08:00", "UTC+08:00"],
    [saoPaulo, "UTC−03:00", "UTC−03:00"],
  ])("should apply date-specific offsets in %s", (zone, winter, summer) => {
    expect(timezoneService.at(Date.UTC(2025, 0, 15, 13), zone).offset).toBe(
      winter,
    )
    expect(timezoneService.at(Date.UTC(2025, 6, 15, 13), zone).offset).toBe(
      summer,
    )
  })

  it.each([
    [newYork, "2025-03-09", "02:30"],
    [london, "2025-03-30", "01:30"],
    [saoPaulo, "2018-11-04", "00:30"],
  ])("should reject a nonexistent local time in %s", (zone, date, time) => {
    expect(timezoneService.resolve({ date, time }, zone)).toEqual({
      kind: "nonexistent",
    })
  })

  it.each([
    [
      newYork,
      "2025-11-02",
      Date.UTC(2025, 10, 2, 5, 30),
      Date.UTC(2025, 10, 2, 6, 30),
    ],
    [
      london,
      "2025-10-26",
      Date.UTC(2025, 9, 26, 0, 30),
      Date.UTC(2025, 9, 26, 1, 30),
    ],
  ])(
    "should expose both occurrences of a repeated time in %s",
    (zone, date, earlier, later) => {
      expect(timezoneService.resolve({ date, time: "01:30" }, zone)).toEqual({
        kind: "ambiguous",
        instants: [earlier, later],
      })
    },
  )

  it("should resolve a unique time and reject an invalid calendar date or hour", () => {
    expect(
      timezoneService.resolve({ date: "2024-02-29", time: "10:15" }, shanghai),
    ).toEqual({
      kind: "unique",
      instants: [Date.UTC(2024, 1, 29, 2, 15)],
    })
    expect(
      timezoneService.resolve({ date: "2025-02-29", time: "10:15" }, shanghai),
    ).toEqual({ kind: "invalid" })
    expect(
      timezoneService.resolve({ date: "2025-01-15", time: "24:15" }, shanghai),
    ).toEqual({ kind: "invalid" })
    expect(timezoneService.at(Date.UTC(2018, 0, 15, 12), saoPaulo).offset).toBe(
      "UTC−02:00",
    )
  })
})
