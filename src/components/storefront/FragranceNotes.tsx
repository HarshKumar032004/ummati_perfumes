'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FragranceNotesProps {
  topNotes: string[]
  middleNotes: string[]
  baseNotes: string[]
}

const tierCopy = {
  Top: 'The first impression',
  Heart: 'The emotional centre',
  Base: 'The lasting trace',
}

function describeNote(note: string, tier: keyof typeof tierCopy) {
  const lower = note.toLowerCase()
  if (lower.includes('bergamot')) return 'Crisp, sparkling morning air.'
  if (lower.includes('rose')) return 'Velvet petals with a quiet radiance.'
  if (lower.includes('oud')) return 'Deep resin, polished wood, warm skin.'
  if (lower.includes('amber')) return 'A soft golden glow that lingers.'
  if (lower.includes('musk')) return 'Bare warmth, close to the body.'
  if (lower.includes('vanilla')) return 'Creamy sweetness, never overstated.'
  return `${tierCopy[tier]} — a considered facet of the composition.`
}

export function FragranceNotes({ topNotes, middleNotes, baseNotes }: FragranceNotesProps) {
  const tiers = [
    { label: 'Top' as const, notes: topNotes },
    { label: 'Heart' as const, notes: middleNotes },
    { label: 'Base' as const, notes: baseNotes },
  ].filter((tier) => tier.notes.length > 0)
  const [activeNote, setActiveNote] = useState<string | null>(null)

  if (tiers.length === 0) return null

  return (
    <section className="mt-16" aria-labelledby="fragrance-architecture">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-label mb-3 text-brand-accent">Accord architecture</p>
          <h2 id="fragrance-architecture" className="font-display text-3xl font-light tracking-[-0.02em] text-foreground">The invisible structure</h2>
        </div>
        <span className="hidden text-label text-text-muted sm:block">Head · Soul · Anchor</span>
      </div>

      <div className="border-y border-hairline">
        {tiers.map(({ label, notes }, index) => (
          <div key={label} className={cn('grid gap-5 py-6 md:grid-cols-[8rem_1fr_auto] md:items-start', index > 0 && 'border-t border-hairline')}>
            <div>
              <p className="text-label text-brand-accent">{label}</p>
              <p className="mt-2 text-xs text-text-muted">{tierCopy[label]}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {notes.map((note) => {
                const isActive = activeNote === note
                return (
                  <button
                    key={note}
                    type="button"
                    onMouseEnter={() => setActiveNote(note)}
                    onMouseLeave={() => setActiveNote(null)}
                    onFocus={() => setActiveNote(note)}
                    onBlur={() => setActiveNote(null)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-label transition-all duration-300',
                      isActive ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-hairline text-text-secondary hover:border-brand-accent/60 hover:text-brand-accent',
                    )}
                  >
                    {note}
                  </button>
                )
              })}
            </div>
            <div className="min-h-5 text-right md:max-w-[14rem]">
              {activeNote && notes.includes(activeNote) && (
                <p className="text-xs italic leading-relaxed text-text-muted">{describeNote(activeNote, label)}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs text-text-muted">
        Hover a note to open its sensory character <ArrowUpRight className="h-3.5 w-3.5 text-brand-accent" strokeWidth={1.2} />
      </p>
    </section>
  )
}
