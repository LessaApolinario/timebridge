import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "TimeBridge",
    short_name: "TimeBridge",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: "#ed4817",
    background_color: "#eae8e6",
    icons: [
      {
        src: "/icons/timebridge-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/timebridge-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/timebridge-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
