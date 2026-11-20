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
        className="mt-4 min-h-52 animate-pulse rounded-2xl border border-border bg-card px-4 py-5 motion-reduce:animate-none sm:min-h-80"
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
