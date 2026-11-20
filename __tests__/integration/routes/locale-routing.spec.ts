/** @jest-environment node */

import proxy from "@/proxy"
import { NextRequest } from "next/server"

const origin = "https://timebridge.example"

function request(pathname: string, headers: HeadersInit = {}) {
  return new NextRequest(new URL(pathname, origin), { headers })
}

describe("locale routing", () => {
  it("should send a first visit from China to Simplified Chinese", () => {
    const response = proxy(
      request("/?cities=london%2Cshanghai&ref=shanghai", {
        "x-vercel-ip-country": "CN",
        "accept-language": "en-US",
      }),
    )

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe(
      `${origin}/zh-CN?cities=london%2Cshanghai&ref=shanghai`,
    )
    expect(response.headers.get("cache-control")).toBe("private, no-store")
  })

  it("should prefer a saved language over country detection at the root", () => {
    const response = proxy(
      request("/", {
        "x-vercel-ip-country": "CN",
        "accept-language": "zh-CN",
        cookie: "NEXT_LOCALE=pt-BR",
      }),
    )

    expect(response.headers.get("location")).toBe(`${origin}/pt-BR`)
  })

  it("should respect an explicit locale over both the cookie and country", () => {
    const response = proxy(
      request("/en-US", {
        "x-vercel-ip-country": "CN",
        "accept-language": "zh-CN",
        cookie: "NEXT_LOCALE=pt-BR",
      }),
    )

    expect(response.headers.get("location")).toBeNull()
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("en-US")
  })

  it.each([
    ["pt-BR,pt;q=0.9,en-US;q=0.8", "pt-BR"],
    ["zh-CN,zh;q=0.9", "zh-CN"],
    ["de-DE,de;q=0.9", "en-US"],
  ])("should resolve the browser language %s to %s", (language, locale) => {
    const response = proxy(request("/", { "accept-language": language }))

    expect(response.headers.get("location")).toBe(`${origin}/${locale}`)
  })
})
