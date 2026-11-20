import { Timebridge } from "@/components/timebridge/timebridge"
import { ArrowDownRight, Globe2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
            aria-label="TimeBridge, início"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Globe2 aria-hidden="true" className="size-5" />
            </span>
            TimeBridge
          </Link>
          <nav
            aria-label="Principal"
            className="flex flex-wrap gap-x-4 text-sm font-medium text-muted-foreground sm:gap-x-6"
          >
            <a className="hover:text-primary" href="#comparador">
              Comparador
            </a>
            <a className="hover:text-primary" href="#planejador">
              Planejador
            </a>
          </nav>
        </div>
      </header>
      <main>
        <section
          aria-labelledby="page-title"
          className="tb-hero border-b border-border"
        >
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
            <h1
              id="page-title"
              className="max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.065em] text-balance sm:text-5xl lg:text-6xl"
            >
              Comparador de fusos horários
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Converta horários entre cidades e encontre um bom momento para
              reunir pessoas em fusos diferentes.
            </p>
            <a
              href="#comparador"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              <ArrowDownRight aria-hidden="true" className="size-4" />
              Comparar horários
            </a>
          </div>
        </section>
        <Timebridge />
        <section
          className="mx-auto max-w-7xl border-t border-border px-4 py-7 sm:px-6 lg:px-8"
          aria-labelledby="about-title"
        >
          <h2 id="about-title" className="text-lg font-semibold tracking-tight">
            Como funciona a comparação
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Escolha uma cidade de referência e informe o horário local. O
            TimeBridge converte o mesmo instante para as outras cidades e usa o
            deslocamento UTC de cada fuso naquela data, incluindo mudanças de
            horário de verão.
          </p>
        </section>
      </main>
      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-4 text-sm text-muted-foreground sm:px-6 lg:px-8">
          <span className="font-semibold text-foreground">TimeBridge</span>
          <span>Os cálculos e as preferências ficam no seu navegador.</span>
        </div>
      </footer>
    </>
  )
}
