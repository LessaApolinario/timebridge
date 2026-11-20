"use client"

import { routing } from "@/i18n/routing"
import { useEffect } from "react"

interface RegisterServiceWorkerProps {
  locale: (typeof routing.locales)[number]
}

export function RegisterServiceWorker({ locale }: RegisterServiceWorkerProps) {
  useEffect(() => {
    const revision = process.env.NEXT_PUBLIC_PWA_REVISION

    if (
      process.env.NODE_ENV !== "production" ||
      !revision ||
      !window.isSecureContext ||
      !("serviceWorker" in navigator)
    ) {
      return
    }

    const workerUrl = new URL("/sw.js", window.location.origin)
    workerUrl.searchParams.set("revision", revision)
    workerUrl.searchParams.set("locales", routing.locales.join(","))
    workerUrl.searchParams.set("defaultLocale", routing.defaultLocale)

    let mounted = true

    async function register() {
      await navigator.serviceWorker.register(workerUrl, {
        scope: "/",
        updateViaCache: "none",
      })
      const registration = await navigator.serviceWorker.ready

      if (mounted) {
        registration.active?.postMessage({ locale })
      }
    }

    void register().catch((error: unknown) => {
      console.warn("TimeBridge could not register its service worker", error)
    })

    return () => {
      mounted = false
    }
  }, [locale])

  return null
}
