import { Link } from "@/i18n/navigation"
import { Clock3 } from "lucide-react"
import { useTranslations } from "next-intl"
import { LocaleSelect } from "./locale-select"

export function SiteHeader() {
  const t = useTranslations("Header")

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 pt-5 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight sm:text-xl"
        aria-label={t("home")}
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
          <Clock3 aria-hidden="true" className="size-5" />
        </span>
        TimeBridge
      </Link>
      <nav
        aria-label={t("navigation")}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-7"
      >
        <a
          className="text-muted-foreground hover:text-foreground"
          href="#cidades"
        >
          {t("cities")}
        </a>
        <a
          className="rounded-full border border-border px-3.5 py-2 hover:bg-muted sm:px-4"
          href="#planejador"
        >
          {t("planner")}
        </a>
        <LocaleSelect />
      </nav>
    </header>
  )
}
