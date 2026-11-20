import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { PHASE_PRODUCTION_BUILD } from "next/constants"
import { randomUUID } from "node:crypto"

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ]
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default function config(phase: string) {
  return createNextIntlPlugin()({
    ...nextConfig,
    env: {
      NEXT_PUBLIC_PWA_REVISION:
        phase === PHASE_PRODUCTION_BUILD ? randomUUID() : "",
    },
  })
}
