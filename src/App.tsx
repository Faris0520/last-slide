import { useEffect, useRef, useState } from 'react'
import { buildMessages, parseCard, CARD_SCHEMA, type SkipCard } from './lib/card'
import { formatPages, planIngest, type IngestPlan } from './lib/ingest'
import { extractPages, isNativeTextPdf, type PdfPage } from './lib/pdf'
import {
  DEFAULT_OLLAMA_URL,
  REQUIRED_MODEL,
  completeViaOllama,
  probeOllama,
  type OllamaStatus,
} from './lib/ollama'

const SAMPLE_URL = '/cs101-hash-tables.pdf'
const SAMPLE_NAME = 'CS 101 Hash Tables (sample)'

type Deck = {
  name: string
  pages: PdfPage[]
  plan: IngestPlan
}

type Phase = 'idle' | 'reading' | 'ready' | 'generating' | 'done' | 'error'

export default function App() {
  const [ollama, setOllama] = useState<OllamaStatus | { kind: 'idle' }>({ kind: 'idle' })
  const [ollamaUrl] = useState(DEFAULT_OLLAMA_URL)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [card, setCard] = useState<SkipCard | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const needsOrigins = origin !== '' && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|$)/i.test(origin)

  async function refreshOllama() {
    setOllama({ kind: 'checking' })
    try {
      setOllama(await probeOllama(ollamaUrl))
    } catch {
      setOllama({ kind: 'unreachable' })
    }
  }

  useEffect(() => {
    void refreshOllama()
  }, [])

  async function loadBuffer(buffer: ArrayBuffer, name: string) {
    setPhase('reading')
    setErrorMsg('')
    setCard(null)
    setConfirmed(false)
    try {
      const pages = await extractPages(buffer)
      if (!isNativeTextPdf(pages)) {
        setDeck(null)
        setErrorMsg(
          'This PDF has almost no extractable text. Last Slide only reads native-text slides, not scans.',
        )
        setPhase('error')
        return
      }
      setDeck({ name, pages, plan: planIngest(pages) })
      setPhase('ready')
    } catch (err) {
      setDeck(null)
      setErrorMsg(err instanceof Error ? err.message : 'Could not read that PDF.')
      setPhase('error')
    }
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Drop a PDF.')
      setPhase('error')
      return
    }
    await loadBuffer(await file.arrayBuffer(), file.name)
  }

  async function loadSample() {
    const res = await fetch(SAMPLE_URL)
    if (!res.ok) {
      setErrorMsg('Sample PDF is missing. Run pnpm sample.')
      setPhase('error')
      return
    }
    await loadBuffer(await res.arrayBuffer(), SAMPLE_NAME)
  }

  async function generate() {
    if (!deck || ollama.kind !== 'ok') return
    setPhase('generating')
    setErrorMsg('')
    try {
      const raw = await completeViaOllama(
        ollamaUrl,
        ollama.model,
        buildMessages(formatPages(deck.plan.sent), deck.pages.length),
        CARD_SCHEMA,
      )
      setCard(parseCard(raw))
      setPhase('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMsg(
        /fetch|network|failed/i.test(msg)
          ? `Could not reach Ollama at ${ollamaUrl}. If this page is not localhost, start Ollama with OLLAMA_ORIGINS=${origin}`
          : msg,
      )
      setPhase('error')
    }
  }

  function reset() {
    setDeck(null)
    setCard(null)
    setConfirmed(false)
    setErrorMsg('')
    setPhase('idle')
  }

  const ollamaReady = ollama.kind === 'ok'
  const generating = phase === 'generating'
  const canSend = ollamaReady && confirmed && (phase === 'ready' || phase === 'error')
  const showingCard = Boolean(card)
  const corner = deck
    ? card?.deadlineSlide
      ? `${card.deadlineSlide} / ${deck.pages.length}`
      : `${deck.plan.sent.length} / ${deck.pages.length}`
    : null

  return (
    <main className="page">
      <article className="frame">
        {!showingCard && (
          <header className="mast">
            <p className="kicker">Lecture skip card</p>
            <h1>Last Slide</h1>
            <p className="lede">
              You skipped the deck. Drop the PDF. Gemma 3 4B, running in Ollama on this machine,
              writes the homework slide: two sentences, the one due date, the one question, and
              what you can ignore.
            </p>
          </header>
        )}

        {!deck && phase !== 'reading' && !showingCard && (
          <section
            className="drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              void onFile(e.dataTransfer.files[0])
            }}
          >
            <input
              ref={fileRef}
              className="sr-only"
              id="pdf-file"
              type="file"
              accept="application/pdf"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
            <p className="drop-title">Drop a lecture PDF</p>
            <p className="drop-hint">
              Native text only. Scans are refused. The file never leaves this tab.
            </p>
            <div className="actions">
              <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
                Choose PDF
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => void loadSample()}>
                Load sample
              </button>
            </div>
          </section>
        )}

        {phase === 'reading' && (
          <p className="status" role="status">
            Reading slides
          </p>
        )}

        {deck && !showingCard && phase !== 'reading' && (
          <section className="ready" aria-live="polite">
            <h2>{deck.name}</h2>
            <p>
              {deck.pages.length} slides. Sending {deck.plan.sent.length} of them
              {deck.plan.keywordPages.length > 0
                ? ` (deadline language on slide ${deck.plan.keywordPages.join(', ')})`
                : ''}
              {deck.plan.skipped.length > 0
                ? `. Holding back ${deck.plan.skipped.length}.`
                : '.'}
            </p>
            <label className="confirm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                Send {deck.plan.chars.toLocaleString()} characters of extracted text to Ollama at{' '}
                {ollamaUrl} ({REQUIRED_MODEL}). The PDF stays in this browser tab.
              </span>
            </label>
            <div className="actions">
              <button
                type="button"
                className="btn"
                disabled={!canSend}
                onClick={() => void generate()}
              >
                {generating ? 'Writing' : 'Write the last slide'}
              </button>
              <button type="button" className="btn btn-quiet" onClick={reset}>
                Clear
              </button>
            </div>
          </section>
        )}

        {phase === 'generating' && (
          <p className="status" role="status">
            Gemma 3 4B is reading the budgeted slides on this machine. On CPU this often takes one
            or two minutes.
          </p>
        )}

        {errorMsg && (
          <p className="error" role="alert">
            {errorMsg}
          </p>
        )}

        {card && (
          <>
            <SlideCard card={card} />
            <div className="actions frame-clear">
              <button type="button" className="btn btn-quiet" onClick={reset}>
                Another deck
              </button>
            </div>
          </>
        )}

        {corner && <p className="corner">{corner}</p>}
      </article>

      <Checklist
        ollama={ollama}
        ollamaUrl={ollamaUrl}
        origin={origin}
        needsOrigins={needsOrigins}
        onRetry={() => void refreshOllama()}
      />
    </main>
  )
}

function Checklist({
  ollama,
  ollamaUrl,
  origin,
  needsOrigins,
  onRetry,
}: {
  ollama: OllamaStatus | { kind: 'idle' }
  ollamaUrl: string
  origin: string
  needsOrigins: boolean
  onRetry: () => void
}) {
  const pull = `ollama pull ${REQUIRED_MODEL}`
  const origins = `OLLAMA_ORIGINS=${origin} ollama serve`
  const reachable = ollama.kind === 'ok' || ollama.kind === 'no-gemma3-4b'

  return (
    <section className="notes" aria-label="Ollama setup">
      <h2>Before the card</h2>
      <ol>
        <li>
          <Status ok={reachable} />
          <div>
            {reachable
              ? `Ollama is reachable at ${ollamaUrl}`
              : `Ollama is not reachable at ${ollamaUrl}`}
            {ollama.kind === 'unreachable' && <code className="cmd">ollama serve</code>}
          </div>
        </li>
        <li>
          <Status ok={ollama.kind === 'ok'} />
          <div>
            {ollama.kind === 'ok'
              ? `Model ${REQUIRED_MODEL} is ready, using ${ollama.model}`
              : `Model ${REQUIRED_MODEL} is not pulled yet`}
            {ollama.kind === 'no-gemma3-4b' && <code className="cmd">{pull}</code>}
          </div>
        </li>
        {needsOrigins && (
          <li>
            <Status ok={false} />
            <div>
              This page is {origin}. Start Ollama with that origin allowed so the browser can reach
              it.
              <code className="cmd">{origins}</code>
            </div>
          </li>
        )}
      </ol>
      {(ollama.kind === 'unreachable' ||
        ollama.kind === 'no-gemma3-4b' ||
        ollama.kind === 'checking') && (
        <button type="button" className="btn btn-quiet" onClick={onRetry}>
          {ollama.kind === 'checking' ? 'Checking' : 'Check again'}
        </button>
      )}
    </section>
  )
}

function Status({ ok }: { ok: boolean }) {
  return (
    <span className={ok ? 'mark ok' : 'mark'} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {ok ? (
          <path
            d="M3.5 8.2l3 3.1 6-6.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
        ) : (
          <rect x="3.25" y="3.25" width="9.5" height="9.5" stroke="currentColor" strokeWidth="1.5" />
        )}
      </svg>
    </span>
  )
}

function SlideCard({ card }: { card: SkipCard }) {
  return (
    <div className="slide">
      <p className="slide-kicker">What you missed</p>
      <p className="missed">{card.missed}</p>

      <div className={card.hasDeadline ? 'due due-hot' : 'due'}>
        <p className="slide-kicker">Due</p>
        {card.hasDeadline ? (
          <p>
            {card.deadline}
            {card.deadlineSlide ? (
              <span className="slide-no"> Slide {card.deadlineSlide}</span>
            ) : null}
          </p>
        ) : (
          <p>Nothing is due.</p>
        )}
      </div>

      <div className="ask">
        <p className="slide-kicker">They will ask</p>
        <p>{card.likelyQuestion}</p>
      </div>

      <div className="skip">
        <p className="slide-kicker">You can skip</p>
        <p>{card.skip}</p>
      </div>
    </div>
  )
}
