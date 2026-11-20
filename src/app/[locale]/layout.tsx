import { RegisterServiceWorker } from "@/components/layout/register-service-worker"
import { routing } from "@/i18n/routing"
import { siteUrl } from "@/lib/site"
import type { Metadata, Viewport } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import "../globals.css"

export const viewport: Viewport = {
  themeColor: "#ed4817",
}

export function generateStaticParams() {
  return routing.locales.map((locale) => {
    return { locale }
  })
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: "Metadata" })
  const title = t("title")
  const description = t("description")
  const pathname = `/${locale}`
  const otherLocales = routing.locales.filter((language) => {
    return language !== locale
  })

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title,
    description,
    icons: {
      apple: {
        url: "/icons/timebridge-apple.png",
        sizes: "180x180",
      },
    },
    alternates: {
      canonical: pathname,
      languages: {
        "x-default": `/${routing.defaultLocale}`,
        "en-US": "/en-US",
        "pt-BR": "/pt-BR",
        "zh-CN": "/zh-CN",
      },
    },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName: "TimeBridge",
      locale: locale.replace("-", "_"),
      alternateLocale: otherLocales.map((language) => {
        return language.replace("-", "_")
      }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <RegisterServiceWorker locale={locale} />
      </body>
    </html>
  )
}
