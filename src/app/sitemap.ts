import { routing } from "@/i18n/routing"
import { siteUrl } from "@/lib/site"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => {
      return [locale, `${siteUrl}/${locale}`]
    }),
  )

  languages["x-default"] = languages[routing.defaultLocale]

  return routing.locales.map((locale) => {
    return {
      url: languages[locale],
      alternates: { languages },
    }
  })
}
