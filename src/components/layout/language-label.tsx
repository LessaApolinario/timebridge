import Image from "next/image"

interface LanguageLabelProps {
  locale: string
  name: string
  flag: string
}

export function LanguageLabel({ locale, name, flag }: LanguageLabelProps) {
  return (
    <span lang={locale} className="inline-flex items-center gap-2">
      <Image
        src={flag}
        alt=""
        width={20}
        height={20}
        className="shrink-0 rounded-xs"
      />
      {name}
    </span>
  )
}
