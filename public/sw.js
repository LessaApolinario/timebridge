const origin = self.location.origin
const settings = new URL(self.location.href).searchParams
const locales = settings.get("locales")?.split(",") ?? []
const localePaths = new Set(locales.map((locale) => `/${locale}`))
const defaultLocalePath = `/${settings.get("defaultLocale")}`
const shellPrefix = "timebridge-shell-"
const shellName = `${shellPrefix}${settings.get("revision")}`
const preferencesName = "timebridge-pwa-preferences"
const lastLocaleKey = new URL("/pwa/last-locale", origin)
const iconAndFlagPaths = [
  "/flags/br.svg",
  "/flags/cn.svg",
  "/flags/us.svg",
  "/icons/timebridge-192.png",
  "/icons/timebridge-512.png",
  "/icons/timebridge-maskable-512.png",
  "/icons/timebridge-apple.png",
]

function assetRequest(path) {
  return new Request(new URL(path, origin), {
    credentials: "omit",
    redirect: "error",
  })
}

function staticAssets(html) {
  // Next emits its entry scripts, styles and preloads as script/link attributes.
  const tags = html.matchAll(/<(?:script|link)\b[^>]*>/gi)
  const assets = []

  for (const [tag] of tags) {
    const attribute = tag.match(/\s(?:src|href)="(\/_next\/static\/[^"\s]+)"/i)

    if (attribute) {
      assets.push(attribute[1].replaceAll("&amp;", "&"))
    }
  }

  return assets
}

async function precache() {
  if (!settings.get("revision") || !localePaths.has(defaultLocalePath)) {
    throw new Error("Missing TimeBridge service worker configuration")
  }

  const pages = await Promise.all(
    [...localePaths].map(async (path) => {
      const request = assetRequest(path)
      const response = await fetch(request, { cache: "reload" })

      if (!response.ok || !response.headers.get("Content-Type")?.startsWith("text/html")) {
        throw new Error(`Could not cache TimeBridge page ${path}`)
      }

      const assets = staticAssets(await response.clone().text())

      if (assets.length === 0) {
        throw new Error(`Could not find Next.js assets for ${path}`)
      }

      return { request, response, assets }
    }),
  )

  const assets = new Set([...iconAndFlagPaths, ...pages.flatMap(({ assets }) => assets)])
  const cache = await caches.open(shellName)

  try {
    await cache.addAll([...assets].map(assetRequest))

    for (const { request, response } of pages) {
      await cache.put(request, response)
    }
  } catch (error) {
    await caches.delete(shellName)
    throw error
  }
}

async function activate() {
  const names = await caches.keys()

  await Promise.all(
    names
      .filter((name) => name.startsWith(shellPrefix) && name !== shellName)
      .map((name) => caches.delete(name)),
  )
  await self.clients.claim()
}

async function rememberLocale(path) {
  const preferences = await caches.open(preferencesName)
  await preferences.put(lastLocaleKey, new Response(path))
}

async function offlinePage(url) {
  if (url.pathname === "/") {
    const preferences = await caches.open(preferencesName)
    const savedPath = await (await preferences.match(lastLocaleKey))?.text()
    const target = new URL(url)
    target.pathname = localePaths.has(savedPath) ? savedPath : defaultLocalePath
    return Response.redirect(target.href)
  }

  const shell = await caches.open(shellName)
  return shell.match(new URL(url.pathname, origin), { ignoreVary: true })
}

async function navigate(request, url) {
  let response

  try {
    response = await fetch(request)

    if (response.status < 500) {
      return response
    }
  } catch {
    // The app can hydrate from the precached document during a network failure.
  }

  return (await offlinePage(url)) ?? response ?? Response.error()
}

async function loadAsset(request) {
  const shell = await caches.open(shellName)
  return (await shell.match(request)) ?? fetch(request)
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(activate())
})

self.addEventListener("message", (event) => {
  const path = `/${event.data?.locale}`

  if (localePaths.has(path) && event.source?.type === "window") {
    event.waitUntil(rememberLocale(path))
  }
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET" || url.origin !== origin) {
    return
  }

  if (request.mode === "navigate" && (url.pathname === "/" || localePaths.has(url.pathname))) {
    event.respondWith(navigate(request, url))
  } else if (url.pathname.startsWith("/_next/static/") || iconAndFlagPaths.includes(url.pathname)) {
    event.respondWith(loadAsset(request))
  }
})
