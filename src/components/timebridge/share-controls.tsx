import { Button } from "@/components/ui/button"
import { Copy, Link2 } from "lucide-react"
import { useRef, useState } from "react"

interface ShareControlsProps {
  summary: string
  link: string
  disableSummary: boolean
  disableLink: boolean
}

interface CopyFeedback {
  status: string
  fallback?: string
}

export function ShareControls({
  summary,
  link,
  disableSummary,
  disableLink,
}: ShareControlsProps) {
  const [feedback, setFeedback] = useState<CopyFeedback>({ status: "" })

  const attempt = useRef(0)

  async function copy(value: string, success: string) {
    const id = ++attempt.current

    try {
      await navigator.clipboard.writeText(value)

      if (id === attempt.current) {
        setFeedback({ status: success })
      }
    } catch {
      if (id === attempt.current) {
        setFeedback({
          status:
            "Cópia automática indisponível. Selecione e copie o texto abaixo.",
          fallback: value,
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-9"
          disabled={disableSummary}
          onClick={() => {
            void copy(summary, "Horários copiados.")
          }}
        >
          <Copy aria-hidden="true" /> Copiar horários
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-9"
          disabled={disableLink}
          onClick={() => {
            void copy(link, "Link copiado.")
          }}
        >
          <Link2 aria-hidden="true" /> Copiar link
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground empty:hidden">
        {feedback.status}
      </p>
      {feedback.fallback && (
        <label className="grid gap-1 text-sm font-medium">
          Texto para copiar
          <textarea
            className="tb-field w-full min-w-0 resize-y"
            readOnly
            value={feedback.fallback}
            onFocus={(event) => {
              event.currentTarget.select()
            }}
          />
        </label>
      )}
    </div>
  )
}
