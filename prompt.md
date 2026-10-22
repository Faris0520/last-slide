# Prompt: draft the Last Slide DEV post

Copy everything below the line into a new agent chat (or paste it as the task). Do not publish. Stage a DEV draft only after the user says yes to creating it.

---

You are drafting **Faris Daffa** (`faris0520`)’s submission post for the Hacktoberfest Open-Source AI Challenge: Week 3.

Write in **English**. First person, as Faris. Match the voice of his earlier HF26 posts, especially:

- https://dev.to/faris0520/touch-soil-an-offline-garden-planner-with-gemma-running-in-your-browser-41pe
- https://dev.to/faris0520/my-friend-rambles-in-interviews-so-i-built-him-unramble-1kf5

Those posts are specific, calm, and technical without marketing words. They explain one real problem, the one design choice that made the product itself, and why a closed API would break that product. Do the same here. Do not imitate Unramble’s “handing it over to a friend” section. Do not imitate Touch Soil’s garden/offline-in-the-field story. Last Slide is a different product.

## What this post is

A DEV Challenge **entry**. Judging weights **Writing Quality** heaviest, then Relevance, Creativity, Technical Execution, then partner use. A thin write-up loses even if the app works. The post must stand alone for a judge who was not in the build session.

Challenge page: https://dev.to/challenges/hacktoberfest-week3-2026-10-19

Theme: **Slow and Steady**. Build with open-weight models or open-source AI that **rewards laziness**. Show the lazy payoff: what effort the tool actually saves.

Prompt (all HF26 weeks): open-source AI at the core (open-weight model, open-source harness, local inference, or a mix). Explain why open innovation matters. Where did the open approach work better than a closed one?

Deadline: **25 Oct 2026, 11:59 PM PDT**. One submission per challenge. New project built in this window, not a PR on an old repo.

## Product facts (do not invent beyond these)

**Last Slide** is a skip card for the lecture PDF you never opened. It is **not** a summarizer, not flashcards, not a file sorter, not a WhatsApp digest, not a study pack.

Flow:

1. Drop a native-text lecture PDF (scans are refused).
2. `pdf.js` extracts text **in this browser tab**. There is no backend. The file never leaves the tab.
3. Ingest is lazy: character budget **4500**. Pages with deadline language (homework, assignment, due, tugas, UTS, UAS, submit, …) are taken first. Remaining pages fill the budget. Extra pages are held back.
4. The user must **confirm** before any extracted text is sent to local Ollama.
5. **Gemma 3 4B** via **Ollama** at `http://localhost:11434`, model tag `gemma3:4b`, constrained with Ollama `format` JSON schema.
6. The UI is the last slide: two sentences of what you missed, the one due date if it is actually on a slide (with slide number), one exam-style question, and one sentence of what you can skip.
7. Bundled English sample: `public/cs101-hash-tables.pdf` (CS 101 Hash Tables, 12 pages, homework on slide 11, appendix on 12).
8. On CPU, generation often takes one or two minutes. Say that honestly.
9. UI English. Design: leftover projector slide (warm paper `#F3EDE0`, ink, one red pen mark `#B42318` only on the due date). Newsreader + IBM Plex Sans. Not a dashboard.

Stack: Vite, React 19, TypeScript, `pdfjs-dist`, plain CSS. MIT. Author: Faris Daffa / M. Faris Daffarindra, UNJA CS, Jambi. Solo.

Read the repo before writing. Ground every technical claim in these files:

- `README.md`
- `DESIGN.md`
- `src/App.tsx`
- `src/lib/pdf.ts`
- `src/lib/ingest.ts` (`CHAR_BUDGET`, `DEADLINE_RE`, keyword-first plan)
- `src/lib/card.ts` (`CARD_SCHEMA`, system prompt, four fields)
- `src/lib/ollama.ts` (`gemma3:4b`, probe, `format` schema)
- `scripts/generate-sample.mjs`

### Unknowns: ask or placeholder, never fake

Do **not** invent:

- GitHub URL (likely `github.com/faris0520/...` only if you verify it exists)
- Render live URL (static UI only; inference still on the visitor’s Ollama. List **Best Use of Render** only if a real Render URL exists)
- Screenshots, GIFs, demo video
- Fake user counts, “X minutes saved” unless Faris measured it. For lazy payoff, describe the **intended** save (skip the 40-page deck, still catch the homework) without fake stopwatch numbers
- Testimonials, teammates, extra prize categories the project does not use
- Agent session id. If the user gives one, embed `{% agent_session <id_or_slug> %}`. Otherwise omit

If repo or demo is missing, write `[REPO URL]` / `[DEMO URL]` and tell Faris what to paste.

## Differentiation (required)

Week 3 is crowded with Sloth-named file sorters and WhatsApp briefs. There is also **LazyLecture**, a local study-pack / flashcard / quiz tool from PDFs. Last Slide is the opposite of that: **you skipped class, you do not want notes, you want the leftover homework slide**. Say this without dunking on other entries. One sentence is enough: you did not build a summarizer on purpose.

## Voice and craft

- No em dash character (`—`). Use comma, period, colon, or parentheses.
- No AI marketing words: seamless, revolutionary, next generation, cutting edge, AI powered, effortless.
- No generic CTAs (Get Started, Learn More).
- No fake SOC2 / uptime / “10K users”.
- Headings start at `##` (the title is the H1). Do not use `#` in the body.
- Alt text on every image.
- Short paragraphs. Concrete nouns. One war story from the actual build (pick one that is real): JSON schema so a 4B model cannot ramble; keyword-first ingest so the homework slide survives the budget; confirmation before Ollama; Vite serving empty CSS until the stale server was killed; scans refused because there is no OCR.
- Credit real open-source: Gemma, Ollama, pdf.js. Link them.
- Disclose AI on the post: this article was drafted with AI assistance. DevRelay should create it with `ai_disclosure_level: some_ai`. Do not set `no_ai`.

Before writing, search DEV for related posts (local Gemma, pdf.js in the browser, constrained JSON with Ollama). Link 1–3 that actually shaped the approach. Cite title, author, and the exact URL. Do not cite from memory.

## Required post structure

Keep these headings, in this order. You may add **The lazy payoff** as its own `##` before Prize Categories. Do not add FAQ, fake testimonials, or a Trusted By bar.

```markdown
*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

## What I Built

## Demo

## Code

## How I Built It

## Why Does Open Innovation Matter?

## The lazy payoff

## Prize Categories
```

### What I Built

The skipped lecture. The dread task is opening the PDF the night before class. Last Slide writes the leftover projector slide so you do not have to. Name the four fields. Say native-text only, nothing uploaded.

### Demo

Live URL if it exists. How to run locally (`ollama pull gemma3:4b`, `pnpm install`, `pnpm sample`, `pnpm dev`). Load the bundled sample. Note Render + `OLLAMA_ORIGINS` if deployed. Screenshots of the drop zone and of a real generated card (sample deck), with alt text. If no screenshots yet, say so and list what Faris should upload.

### Code

Repo link. `{% github URL %}` if the repo is public. Point judges at `src/lib/ingest.ts`, `src/lib/card.ts`, `src/lib/ollama.ts`. One short real snippet is better than a dump. No secrets.

### How I Built It

Boring stack, interesting constraints:

- Browser `pdf.js`, no server
- 4500-character budget, deadline pages first
- Gemma 3 4B + Ollama JSON schema (same idea as Unramble/Touch Soil: small models stay useful when decoding is constrained)
- Confirm before send
- UI is one slide, not a card grid
- Honest CPU wait

### Why Does Open Innovation Matter?

Ground it in **this** product, not a generic privacy essay:

- The lecture PDF is the student’s unread work. A closed API would upload it.
- Inference is Ollama on the machine they already have. After pull, no API bill.
- Model tag is one string. Swap Gemma sizes when the laptop allows.
- A cloud summarizer would also tempt you to ask for a full recap. The open stack made a **small, local, four-field card** possible without paying per page.

### The lazy payoff

What effort it saves: you still skip the deck, and you still see the homework and the likely question. Do not claim a measured minute count unless Faris timed it. Optional: walk the sample PDF (homework slide 11 kept because of deadline language; appendix 12 is skip).

### Prize Categories

Only what the project **genuinely** uses:

- **Gemma** (required): Gemma 3 4B locally through Ollama, JSON-constrained skip card.
- **Render** (only if deployed): static UI on Render; inference still local. Say that split honestly. Render’s category allows hosting the front end.

Do not list Copilot, ElevenLabs, Auth0, MongoDB, etc.

## Title, tags, description

- Title: distinctive, delivers on the promise. Examples of the shape (write a better one): “I skipped the lecture PDF, so I made it write the last slide” or “Last Slide: the homework card for the deck you never opened”. Do not use “Sloth” in the name. Do not clickbait.
- Tags, **maximum four**, must include: `devchallenge`, `hf26challenge`. Third: `hacktoberfest` (as in his Week 1 post). Fourth only if it exists on DEV and fits (`webdev` or `pdf`). Never invent a tag.
- Description: one or two sentences for the social card, no em dash.

## What to produce

1. Full `body_markdown` ready to paste.
2. Proposed `title`, `tags`, `description`.
3. A short checklist of missing assets (repo, Render URL, screenshots, session embed).
4. If Faris then says to save it to DEV: `create_article` with `published: false`, leave `ai_disclosure_level` unset (defaults to `some_ai`). Hand him **`edit_url`**, not the temp slug `url`. Do not publish unless he explicitly says to publish this post.

Do not create a second draft if an unpublished Last Slide post already exists; update that one.
