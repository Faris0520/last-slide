import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export type PdfPage = {
  n: number
  text: string
}

const MIN_TEXT = 50

export async function extractPages(data: ArrayBuffer): Promise<PdfPage[]> {
  const doc = await pdfjs.getDocument({ data }).promise
  const pages: PdfPage[] = []
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    pages.push({ n, text })
  }
  return pages
}

export function isNativeTextPdf(pages: PdfPage[]): boolean {
  const total = pages.reduce((sum, p) => sum + p.text.length, 0)
  return total >= MIN_TEXT
}
