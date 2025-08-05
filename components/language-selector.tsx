"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/hooks/use-language"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">{t("language")}:</span>
      <Select value={language} onValueChange={(value: "en" | "hi") => setLanguage(value)}>
        <SelectTrigger className="w-24 bg-transparent border-white text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिंदी</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
