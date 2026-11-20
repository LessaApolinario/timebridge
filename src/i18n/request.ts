import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { locale as routeLocale } from "next/root-params"
import { routing } from "./routing"

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? (await routeLocale())

  if (!hasLocale(routing.locales, requestedLocale)) {
    notFound()
  }

  return {
    locale: requestedLocale,
    messages: (await import(`./messages/${requestedLocale}.json`)).default,
    timeZone: "UTC",
  }
})
