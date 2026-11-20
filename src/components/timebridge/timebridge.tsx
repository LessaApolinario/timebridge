"use client"

import { useSyncExternalStore } from "react"
import { TimebridgeWorkspace } from "./timebridge-workspace"

function subscribeToHydration() {
  return () => {}
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

export function Timebridge() {
  const ready = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  )

  if (!ready) {
    return (
      <section
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        aria-busy="true"
        id="comparador"
      >
        <p role="status" className="text-sm text-muted-foreground">
          Carregando comparador de horários…
        </p>
      </section>
    )
  }

  return <TimebridgeWorkspace />
}
