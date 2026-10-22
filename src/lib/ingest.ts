import type { PdfPage } from './pdf'

export const CHAR_BUDGET = 4_500

export const DEADLINE_RE =
  /\b(tugas|pengumpulan|homework|assignment|due\s+date|\bdue\b|deadline|uts|uas|submit)\b/i

export type IngestPlan = {
  sent: PdfPage[]
  skipped: number[]
  keywordPages: number[]
  chars: number
}

export function planIngest(pages: PdfPage[]): IngestPlan {
  const keyword = pages.filter((p) => DEADLINE_RE.test(p.text))
  const keywordNs = new Set(keyword.map((p) => p.n))

  const sent: PdfPage[] = []
  let chars = 0

  function take(page: PdfPage) {
    if (chars >= CHAR_BUDGET) return
    const room = CHAR_BUDGET - chars
    const text = page.text.length > room ? page.text.slice(0, room) : page.text
    sent.push({ n: page.n, text })
    chars += text.length
  }

  for (const page of keyword) take(page)
  for (const page of pages) {
    if (keywordNs.has(page.n)) continue
    take(page)
  }

  sent.sort((a, b) => a.n - b.n)
  const sentNs = new Set(sent.map((p) => p.n))
  const skipped = pages.filter((p) => !sentNs.has(p.n)).map((p) => p.n)

  return {
    sent,
    skipped,
    keywordPages: keyword.map((p) => p.n),
    chars,
  }
}

export function formatPages(pages: PdfPage[]): string {
  return pages.map((p) => `--- slide ${p.n} ---\n${p.text}`).join('\n\n')
}
