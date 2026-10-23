# Last Slide

https://last-slide.onrender.com

A skip card for the lecture PDF you never opened.

![](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/gt9vylaaup4jhgij8gkx.png)

Last Slide is built for the morning after you skipped class. Instead of generating sprawling AI summaries, study guides, or flashcard decks, it produces a single focused skip card: two sentences on what the lecture taught, the exact due date if one is on a slide, one exam question, and what you can safely ignore.

The entire process runs client-side and locally. Your PDF is extracted directly in your browser tab through `pdf.js`, and inference runs on your own hardware via **Gemma 3 4B** in **Ollama**. No files are uploaded to any external server.

---

## The Skip Card

Every slide deck is distilled into four concrete fields:

1. **What you missed**: Exactly two sentences explaining the core topic taught in the lecture.
2. **Due date**: The assignment deadline and task copied verbatim from the slide, along with the slide number. If nothing is due, it states that plainly.
3. **They will ask**: One realistic, exam-style question grounded directly in the slide content.
4. **You can skip**: Specific sections, appendices, or secondary examples you can ignore without falling behind.

---

## How It Works

```
[ Lecture PDF ]
       │
       ▼
[ Browser Tab (pdf.js) ]
  • Client-side text extraction
  • Refuses image scans (minimum text threshold)
  • No backend upload
       │
       ▼
[ Keyword-First Ingest Plan ]
  • 4,500 character budget
  • Prioritizes slides with deadline terms (homework, tugas, submit, UTS, etc.)
  • Holds back overflow slides
       │
       ▼
[ User Confirmation Gate ]
  • Shows exact slides sent and character count
  • Requires explicit confirmation before sending to Ollama
       │
       ▼
[ Local Ollama (Gemma 3 4B) ]
  • Strict JSON Schema constraint (CARD_SCHEMA)
  • Temperature 0.2 for deterministic extraction
       │
       ▼
[ The Last Slide Card ]
```

### 1. In-Browser Text Extraction
The PDF is parsed locally using `pdfjs-dist`. Scanned documents with no extractable text are rejected immediately to ensure reliable extraction without covert cloud OCR.

### 2. Keyword-First Ingest Budget
Lecture decks can be 40 to 60 slides long. Last Slide uses a 4,500 character budget to keep inference fast and responsive on consumer hardware:
- Slides matching deadline and assignment keywords (`homework`, `due date`, `tugas`, `submit`, `UTS`, `UAS`) are placed at the front of the queue.
- Remaining slides fill the remaining budget.
- Unnecessary filler slides are held back.

### 3. User Confirmation Gate
Nothing leaves the tab without your permission. Before sending extracted text to Ollama, the interface displays the exact slide count, character count, and target URL, requiring you to check a confirmation box.

### 4. Schema-Constrained Local Inference
The text is sent to Ollama running locally at `http://localhost:11434`. By passing a strict JSON schema (`CARD_SCHEMA`) directly to Ollama's `format` parameter, Gemma 3 4B is forced to return structured output matching the skip card structure without extra conversational filler.

---

## Prerequisites

- [Ollama](https://ollama.com) installed and running.
- The `gemma3:4b` model pulled locally.
- Node.js (v18+) and [pnpm](https://pnpm.io).

---

## Quick Start

### 1. Prepare Ollama

Pull the Gemma 3 4B model:

```bash
ollama pull gemma3:4b
ollama serve
```

### 2. Install and Run Last Slide

```bash
# Clone the repository
git clone https://github.com/faris0520/last-slide.git
cd last-slide

# Install dependencies
pnpm install

# Generate the bundled sample PDF (CS 101 Hash Tables)
pnpm sample

# Start the development server
pnpm dev
```

Open the local Vite URL in your browser (typically `http://localhost:5173`).

You can test immediately with the built-in sample deck by clicking **Load sample**, or drop your own lecture PDF.

---

## Connecting to a Deployed Frontend

If you access Last Slide hosted on a remote domain (such as Render) over HTTPS, your browser will block requests to `http://localhost:11434` unless Ollama explicitly permits the web origin via CORS.

Configure `OLLAMA_ORIGINS` when launching Ollama:

### Linux / macOS

```bash
OLLAMA_ORIGINS=https://YOUR-APP.onrender.com ollama serve
```

### Windows PowerShell

```powershell
$env:OLLAMA_ORIGINS="https://YOUR-APP.onrender.com"; ollama serve
```

### Allow all origins (local testing)

```bash
OLLAMA_ORIGINS="*" ollama serve
```

---

## Project Structure

```
├── public/
│   └── cs101-hash-tables.pdf   # Generated 12-page sample lecture deck
├── scripts/
│   └── generate-sample.mjs     # Script generating sample PDF with pdf-lib
├── src/
│   ├── lib/
│   │   ├── card.ts             # JSON schema, prompt builder, card parser
│   │   ├── ingest.ts           # Character budgeting & keyword prioritization
│   │   ├── ollama.ts           # Ollama health probe and chat completion API
│   │   └── pdf.ts              # Client-side PDF text extraction via pdf.js
│   ├── App.tsx                 # Main application UI and workflow states
│   ├── index.css               # Warm paper and projector slide styling
│   └── main.tsx                # React application entry point
├── package.json
└── vite.config.ts
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts Vite development server with hot module replacement |
| `pnpm sample` | Compiles `public/cs101-hash-tables.pdf` using `pdf-lib` |
| `pnpm build` | Typechecks with `tsc` and builds production bundle to `dist/` |
| `pnpm preview` | Serves the local production build for testing |

---

## Deployment (Render)

Last Slide builds as a static website. All LLM inference remains on the user's local machine via their Ollama instance.

- **Type**: Static Site
- **Build Command**: `pnpm install && pnpm sample && pnpm build`
- **Publish Directory**: `dist`

---

## Privacy & Security

- **Zero Cloud Uploads**: The PDF file never leaves the browser tab.
- **Local Inference**: Prompts are sent solely to your local Ollama port (`localhost:11434`).
- **No Hidden OCR**: Non-text documents are refused up front, preventing accidental leaks to online OCR tools.
- **Explicit Consent**: You verify the payload size and destination before inference begins.

---

## Credit

Built for the [Hacktoberfest Open-Source AI Challenge](https://dev.to/challenges/hacktoberfest-week3-2026-10-19), week 3: Slow and Steady.
