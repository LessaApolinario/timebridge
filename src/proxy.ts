import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { localeCookieName, routing } from "./i18n/routing"

const handleLocale = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return handleLocale(request)
  }

  const savedLocale = request.cookies.get(localeCookieName)?.value
  const hasSavedLocale = routing.locales.some((locale) => {
    return locale === savedLocale
  })

  let response

  if (!hasSavedLocale && request.headers.get("x-vercel-ip-country") === "CN") {
    const url = request.nextUrl.clone()
    url.pathname = "/zh-CN"
    response = NextResponse.redirect(url)
  } else {
    response = handleLocale(request)
  }

  response.headers.set("Cache-Control", "private, no-store")
  return response
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
}
