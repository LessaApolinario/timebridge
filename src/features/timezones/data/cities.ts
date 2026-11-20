import type { City } from "../models/city"

export const cities: readonly City[] = [
  {
    id: "sao-paulo",
    countryCode: "BR",
    zone: "America/Sao_Paulo",
  },
  {
    id: "new-york",
    countryCode: "US",
    zone: "America/New_York",
  },
  {
    id: "london",
    countryCode: "GB",
    zone: "Europe/London",
  },
  {
    id: "shanghai",
    countryCode: "CN",
    zone: "Asia/Shanghai",
  },
  {
    id: "manaus",
    countryCode: "BR",
    zone: "America/Manaus",
  },
  {
    id: "recife",
    countryCode: "BR",
    zone: "America/Recife",
  },
  {
    id: "buenos-aires",
    countryCode: "AR",
    zone: "America/Argentina/Buenos_Aires",
  },
  {
    id: "santiago",
    countryCode: "CL",
    zone: "America/Santiago",
  },
  {
    id: "bogota",
    countryCode: "CO",
    zone: "America/Bogota",
  },
  {
    id: "mexico-city",
    countryCode: "MX",
    zone: "America/Mexico_City",
  },
  {
    id: "los-angeles",
    countryCode: "US",
    zone: "America/Los_Angeles",
  },
  {
    id: "chicago",
    countryCode: "US",
    zone: "America/Chicago",
  },
  {
    id: "toronto",
    countryCode: "CA",
    zone: "America/Toronto",
  },
  {
    id: "lisbon",
    countryCode: "PT",
    zone: "Europe/Lisbon",
  },
  {
    id: "paris",
    countryCode: "FR",
    zone: "Europe/Paris",
  },
  {
    id: "berlin",
    countryCode: "DE",
    zone: "Europe/Berlin",
  },
  {
    id: "madrid",
    countryCode: "ES",
    zone: "Europe/Madrid",
  },
  {
    id: "cairo",
    countryCode: "EG",
    zone: "Africa/Cairo",
  },
  {
    id: "johannesburg",
    countryCode: "ZA",
    zone: "Africa/Johannesburg",
  },
  {
    id: "dubai",
    countryCode: "AE",
    zone: "Asia/Dubai",
  },
  {
    id: "new-delhi",
    countryCode: "IN",
    zone: "Asia/Kolkata",
  },
  {
    id: "singapore",
    countryCode: "SG",
    zone: "Asia/Singapore",
  },
  {
    id: "seoul",
    countryCode: "KR",
    zone: "Asia/Seoul",
  },
  {
    id: "tokyo",
    countryCode: "JP",
    zone: "Asia/Tokyo",
  },
  {
    id: "adelaide",
    countryCode: "AU",
    zone: "Australia/Adelaide",
  },
  {
    id: "sydney",
    countryCode: "AU",
    zone: "Australia/Sydney",
  },
  {
    id: "auckland",
    countryCode: "NZ",
    zone: "Pacific/Auckland",
  },
]

export const citiesById = new Map(
  cities.map((city) => {
    return [city.id, city]
  }),
)

export const defaultCityIds = ["sao-paulo", "new-york", "london"]
export const minimumCities = 2
export const maximumCities = 5
