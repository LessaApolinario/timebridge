import english from "@/i18n/messages/en-US.json"
import portuguese from "@/i18n/messages/pt-BR.json"
import chinese from "@/i18n/messages/zh-CN.json"
import { render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactElement } from "react"

const messages = {
  "en-US": english,
  "pt-BR": portuguese,
  "zh-CN": chinese,
}

export function renderWithLocale(
  ui: ReactElement,
  locale: keyof typeof messages = "pt-BR",
) {
  return render(ui, {
    wrapper: ({ children }) => {
      return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages[locale]}
          timeZone="UTC"
        >
          {children}
        </NextIntlClientProvider>
      )
    },
  })
}
