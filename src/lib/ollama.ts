export const DEFAULT_OLLAMA_URL = 'http://localhost:11434'
export const REQUIRED_MODEL = 'gemma3:4b'

export type ChatTurn = {
  role: 'system' | 'user'
  content: string
}

export type OllamaStatus =
  | { kind: 'checking' }
  | { kind: 'ok'; models: string[]; model: string }
  | { kind: 'unreachable' }
  | { kind: 'no-gemma3-4b'; models: string[] }

function base(url: string) {
  return url.replace(/\/+$/, '')
}

export function pickGemma3_4b(names: string[]): string | null {
  const exact = names.find((n) => n === REQUIRED_MODEL || n.startsWith(`${REQUIRED_MODEL}-`))
  if (exact) return exact
  const fourB = names.find((n) => /gemma3:4b\b/i.test(n) || /gemma3:4b-/i.test(n))
  return fourB ?? null
}

export async function probeOllama(url: string): Promise<OllamaStatus> {
  const res = await fetch(`${base(url)}/api/tags`)
  if (!res.ok) throw new Error(`Ollama answered ${res.status}`)
  const data = (await res.json()) as { models?: { name?: string }[] }
  const models = (data.models ?? []).map((m) => m.name ?? '').filter(Boolean)
  const model = pickGemma3_4b(models)
  if (!model) return { kind: 'no-gemma3-4b', models }
  return { kind: 'ok', models, model }
}

export async function completeViaOllama(
  url: string,
  model: string,
  messages: ChatTurn[],
  schema: Record<string, unknown>,
): Promise<string> {
  const res = await fetch(`${base(url)}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      format: schema,
      stream: false,
      options: { temperature: 0.2, top_p: 0.9 },
    }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Ollama answered ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }
  const data = (await res.json()) as { message?: { content?: string } }
  return data.message?.content ?? ''
}
