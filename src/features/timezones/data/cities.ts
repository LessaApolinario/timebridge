import type { City } from "../models/city"

export const cities: readonly City[] = [
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brasil",
    zone: "America/Sao_Paulo",
  },
  {
    id: "new-york",
    name: "Nova York",
    country: "Estados Unidos",
    zone: "America/New_York",
  },
  {
    id: "london",
    name: "Londres",
    country: "Reino Unido",
    zone: "Europe/London",
  },
  {
    id: "shanghai",
    name: "Xangai",
    country: "China",
    zone: "Asia/Shanghai",
  },
  {
    id: "manaus",
    name: "Manaus",
    country: "Brasil",
    zone: "America/Manaus",
  },
  {
    id: "recife",
    name: "Recife",
    country: "Brasil",
    zone: "America/Recife",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    zone: "America/Argentina/Buenos_Aires",
  },
  {
    id: "santiago",
    name: "Santiago",
    country: "Chile",
    zone: "America/Santiago",
  },
  {
    id: "bogota",
    name: "Bogotá",
    country: "Colômbia",
    zone: "America/Bogota",
  },
  {
    id: "mexico-city",
    name: "Cidade do México",
    country: "México",
    zone: "America/Mexico_City",
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    country: "Estados Unidos",
    zone: "America/Los_Angeles",
  },
  {
    id: "chicago",
    name: "Chicago",
    country: "Estados Unidos",
    zone: "America/Chicago",
  },
  {
    id: "toronto",
    name: "Toronto",
    country: "Canadá",
    zone: "America/Toronto",
  },
  {
    id: "lisbon",
    name: "Lisboa",
    country: "Portugal",
    zone: "Europe/Lisbon",
  },
  {
    id: "paris",
    name: "Paris",
    country: "França",
    zone: "Europe/Paris",
  },
  {
    id: "berlin",
    name: "Berlim",
    country: "Alemanha",
    zone: "Europe/Berlin",
  },
  {
    id: "madrid",
    name: "Madri",
    country: "Espanha",
    zone: "Europe/Madrid",
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egito",
    zone: "Africa/Cairo",
  },
  {
    id: "johannesburg",
    name: "Joanesburgo",
    country: "África do Sul",
    zone: "Africa/Johannesburg",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "Emirados Árabes Unidos",
    zone: "Asia/Dubai",
  },
  {
    id: "new-delhi",
    name: "Nova Déli",
    country: "Índia",
    zone: "Asia/Kolkata",
  },
  {
    id: "singapore",
    name: "Singapura",
    country: "Singapura",
    zone: "Asia/Singapore",
  },
  {
    id: "seoul",
    name: "Seul",
    country: "Coreia do Sul",
    zone: "Asia/Seoul",
  },
  {
    id: "tokyo",
    name: "Tóquio",
    country: "Japão",
    zone: "Asia/Tokyo",
  },
  {
    id: "adelaide",
    name: "Adelaide",
    country: "Austrália",
    zone: "Australia/Adelaide",
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Austrália",
    zone: "Australia/Sydney",
  },
  {
    id: "auckland",
    name: "Auckland",
    country: "Nova Zelândia",
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
