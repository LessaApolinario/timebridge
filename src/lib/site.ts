const productionUrl = process.env.SITE_URL ?? ""

function resolveSiteUrl(value: string | undefined) {
  if (!value) {
    return productionUrl
  }

  try {
    const url = new URL(value)

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.origin
    }
  } catch {
    return productionUrl
  }

  return productionUrl
}

export const siteUrl = resolveSiteUrl(process.env.SITE_URL)
export const siteTitle = "TimeBridge | Comparador de fusos horários"
export const siteDescription =
  "Compare horários entre cidades, converta datas e encontre horários em comum para reuniões internacionais."
