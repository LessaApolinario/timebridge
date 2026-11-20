import { SiteHeader } from "@/components/layout/site-header"
import { Timebridge } from "@/components/timebridge/timebridge"
import { useTranslations } from "next-intl"

export default function Home() {
  const t = useTranslations("Home")

  return (
    <div className="min-h-svh bg-frame px-2.5 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-368 rounded-panel bg-background shadow-panel">
        <SiteHeader />
        <main className="px-5 pt-8 pb-9 sm:px-8 sm:pt-10 sm:pb-12 lg:px-12 lg:pt-14">
          <h1
            id="page-title"
            className="text-sm font-medium tracking-wide text-muted-foreground"
          >
            {t("title")}
          </h1>
          <Timebridge />
          <section
            aria-labelledby="about-title"
            className="mt-10 border-t border-border pt-5"
          >
            <h2
              id="about-title"
              className="text-base font-semibold tracking-tight"
            >
              {t("aboutTitle")}
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t("about")}
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
