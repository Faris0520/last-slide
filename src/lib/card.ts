import type { ChatTurn } from './ollama'

export const CARD_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    missed: { type: 'string' },
    has_deadline: { type: 'boolean' },
    deadline: { type: 'string' },
    deadline_slide: { type: 'integer' },
    likely_question: { type: 'string' },
    skip: { type: 'string' },
  },
  required: [
    'missed',
    'has_deadline',
    'deadline',
    'deadline_slide',
    'likely_question',
    'skip',
  ],
}

export type SkipCard = {
  missed: string
  hasDeadline: boolean
  deadline: string
  deadlineSlide: number | null
  likelyQuestion: string
  skip: string
}

export function parseCard(raw: string): SkipCard {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
  const data = JSON.parse(trimmed) as {
    missed?: unknown
    has_deadline?: unknown
    deadline?: unknown
    deadline_slide?: unknown
    likely_question?: unknown
    skip?: unknown
  }
  const missed = String(data.missed ?? '').trim()
  const likelyQuestion = String(data.likely_question ?? '').trim()
  const skip = String(data.skip ?? '').trim()
  if (!missed || !likelyQuestion || !skip) throw new Error('malformed card')

  const hasDeadline = Boolean(data.has_deadline)
  const slide = Number(data.deadline_slide)
  return {
    missed,
    hasDeadline,
    deadline: hasDeadline ? String(data.deadline ?? '').trim() : '',
    deadlineSlide: hasDeadline && Number.isFinite(slide) && slide > 0 ? slide : null,
    likelyQuestion,
    skip,
  }
}

const SYSTEM = [
  'You write the last slide of a lecture the student skipped.',
  'Use only the slide text provided. Do not invent facts, dates, or homework.',
  'missed: exactly two complete sentences (not a title, not a slide number) on what the lecture taught.',
  'has_deadline: true only if a homework, assignment, or due date is written on a slide.',
  'If has_deadline is false, deadline is an empty string and deadline_slide is 0.',
  'If has_deadline is true, deadline is one short line copied from the slide, and deadline_slide is that slide number.',
  'likely_question: one exam-style question in a complete sentence, grounded in the slides. Not a list.',
  'skip: one complete sentence on the appendix, extra reading, or repeated examples the student can ignore. Not a slide number.',
  'No overview. No extra keys. No markdown.',
].join(' ')

export function buildMessages(deckText: string, pageCount: number): ChatTurn[] {
  return [
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `This lecture has ${pageCount} slides. You are given a budgeted subset, labeled by slide number.\n\n${deckText}`,
    },
  ]
}
