# Last Slide

A skip card for the lecture PDF you never opened.

Drop a native-text slide deck. Last Slide reads it in this browser tab (`pdf.js`), keeps only a budget of pages (deadline language always included), and asks **Gemma 3 4B** via local **Ollama** for four fields: two sentences of what you missed, the one due date if it is actually on a slide, one exam question, and what you can skip. Scans are refused. Nothing is uploaded.

## Setup

1. [Install Ollama](https://ollama.com) and pull the model:

```bash
ollama pull gemma3:4b
ollama serve
```

2. Install and run the app:

```bash
pnpm install
pnpm sample
pnpm dev
```

Open the URL Vite prints. Load the bundled sample (`CS 101 Hash Tables`) or drop your own PDF. Confirm before anything is sent to `http://localhost:11434`.

If you open a **deployed** https page (Render), the browser will block `localhost` unless Ollama allows that origin:

```bash
OLLAMA_ORIGINS=https://YOUR-APP.onrender.com ollama serve
```

On Windows PowerShell:

```powershell
$env:OLLAMA_ORIGINS="https://YOUR-APP.onrender.com"; ollama serve
```

## Deploy (Render)

Static site.

- Build command: `pnpm install && pnpm sample && pnpm build`
- Publish directory: `dist`

Inference still happens on the visitor’s machine. The Render URL is the UI.

## License

MIT.
