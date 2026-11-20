import { defaultWorkHours } from "@/features/meetings/models/meeting"
import {
  defaultConfiguration,
  restoreShareState,
  shareUrl,
  type ShareState,
} from "@/lib/url-state"

const fallback: ShareState = {
  ...defaultConfiguration,
  instant: Date.UTC(2025, 0, 15, 13),
}

describe("share state", () => {
  it("should round-trip a complete configuration including default work hours", () => {
    const state: ShareState = {
      cityIds: ["new-york", "shanghai", "sao-paulo"],
      referenceId: "shanghai",
      instant: Date.UTC(2025, 10, 2, 6, 30, 6, 456),
      duration: 60,
      work: { shanghai: { start: "08:30", end: "17:45" } },
    }
    const url = new URL(shareUrl("https://timebridge.example", state))

    expect(url.pathname).toBe("/")
    expect(restoreShareState(url.search, fallback)).toEqual({
      ...state,
      work: {
        ...state.work,
        "new-york": defaultWorkHours,
        "sao-paulo": defaultWorkHours,
      },
    })
  })

  it("should use fallback values for invalid parameters independently", () => {
    const params = new URLSearchParams({
      cities: "unknown,new-york,new-york",
      ref: "shanghai",
      at: "2025-02-29T13:00:00.000Z",
      minutes: "100",
      work: "new-york~21:00~08:00,__proto__~09:00~18:00,london~08:00~15:00",
    })

    expect(restoreShareState(params.toString(), fallback)).toEqual({
      ...fallback,
      work: { london: { start: "08:00", end: "15:00" } },
    })
  })

  it("should limit city count and ignore overlong queries", () => {
    const result = restoreShareState(
      "?cities=new-york,new-york,shanghai,london,tokyo,berlin,sao-paulo&ref=sao-paulo",
      fallback,
    )

    expect(result.cityIds).toEqual([
      "new-york",
      "shanghai",
      "london",
      "tokyo",
      "berlin",
    ])
    expect(result.referenceId).toBe("new-york")
    expect(
      restoreShareState(
        `?cities=${"sao-paulo,".repeat(300)}&minutes=60`,
        fallback,
      ),
    ).toBe(fallback)
  })
})
