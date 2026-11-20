import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.spec.[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/e2e/"],
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
const resolveJestConfig = createJestConfig(config)

export default async function jestConfig() {
  const resolvedConfig = await resolveJestConfig()

  return {
    ...resolvedConfig,
    transformIgnorePatterns: [
      "node_modules/(?!next-intl/|use-intl/|intl-messageformat/|@formatjs/|icu-minify/)",
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  }
}
