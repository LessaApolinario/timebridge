import { Button } from "@/components/ui/button"
import { Copy, Link2 } from "lucide-react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("Share")
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
          status: t("unavailable"),
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
          className="min-h-10 rounded-full px-3.5"
          disabled={disableSummary}
          onClick={() => {
            void copy(summary, t("timesCopied"))
          }}
        >
          <Copy aria-hidden="true" /> {t("copyTimes")}
        </Button>
        <Button
          type="button"
          className="min-h-10 rounded-full px-3.5"
          disabled={disableLink}
          onClick={() => {
            void copy(link, t("linkCopied"))
          }}
        >
          <Link2 aria-hidden="true" /> {t("copyLink")}
        </Button>
      </div>
      <p role="status" className="text-xs text-muted-foreground empty:hidden">
        {feedback.status}
      </p>
      {feedback.fallback && (
        <label className="grid gap-1 text-sm font-medium">
          {t("fallback")}
          <textarea
            className="min-h-10 w-full min-w-0 resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"
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
