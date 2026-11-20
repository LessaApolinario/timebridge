"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { hasLocale, useLocale, useTranslations } from "next-intl"
import Image from "next/image"

type Locale = (typeof routing.locales)[number]

const languages = {
  "en-US": { name: "English (US)", flag: "/flags/us.svg" },
  "pt-BR": { name: "Português (Brasil)", flag: "/flags/br.svg" },
  "zh-CN": { name: "简体中文", flag: "/flags/cn.svg" },
} satisfies Record<Locale, { name: string; flag: string }>

export function LocaleSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const t = useTranslations("Header")
  const locale = hasLocale(routing.locales, currentLocale)
    ? currentLocale
    : routing.defaultLocale

  function changeLocale(value: string | null) {
    if (!hasLocale(routing.locales, value) || value === locale) {
      return
    }

    const { search, hash } = window.location
    router.replace(`${pathname}${search}${hash}`, {
      locale: value,
      scroll: false,
    })
  }

  return (
    <Select value={locale} onValueChange={changeLocale}>
      <SelectTrigger
        aria-label={t("language")}
        className="min-h-10 w-auto rounded-full px-3.5 hover:bg-muted"
      >
        <SelectValue>
          <LanguageLabel locale={locale} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        className="min-w-44"
      >
        {routing.locales.map((language) => {
          return (
            <SelectItem
              key={language}
              value={language}
              label={languages[language].name}
            >
              <LanguageLabel locale={language} />
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

function LanguageLabel({ locale }: { locale: Locale }) {
  const { name, flag } = languages[locale]

  return (
    <span lang={locale} className="inline-flex items-center gap-2">
      <Image
        src={flag}
        alt=""
        width={20}
        height={15}
        className="shrink-0 rounded-xs"
      />
      {name}
    </span>
  )
}
