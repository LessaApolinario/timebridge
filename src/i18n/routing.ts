import { defineRouting } from "next-intl/routing"

export const localeCookieName = "NEXT_LOCALE"

export const routing = defineRouting({
  locales: ["en-US", "pt-BR", "zh-CN"],
  defaultLocale: "en-US",
  localeCookie: {
    name: localeCookieName,
    maxAge: 60 * 60 * 24 * 365,
  },
  alternateLinks: false,
})
