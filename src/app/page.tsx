import { SiteHeader } from "@/components/layout/site-header"
import { Timebridge } from "@/components/timebridge/timebridge"

export default function Home() {
  return (
    <div className="min-h-svh bg-frame px-2.5 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-368 rounded-panel bg-background shadow-panel">
        <SiteHeader />
        <main className="px-5 pt-8 pb-9 sm:px-8 sm:pt-10 sm:pb-12 lg:px-12 lg:pt-14">
          <h1
            id="page-title"
            className="text-sm font-medium tracking-wide text-muted-foreground"
          >
            Comparador de fusos horários
          </h1>
          <Timebridge />
          <section
            aria-labelledby="about-title"
            className="mt-10 border-t border-border pt-5"
          >
            <h2
              id="about-title"
              className="text-base font-semibold tracking-tight"
            >
              Como funciona a comparação
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              O TimeBridge converte o mesmo instante entre cidades e aplica o
              deslocamento UTC de cada fuso na data escolhida, incluindo
              mudanças de horário de verão.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
