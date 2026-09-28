'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface FragranceNotesProps { topNotes: string[]; middleNotes: string[]; baseNotes: string[] }

export function FragranceNotes({ topNotes, middleNotes, baseNotes }: FragranceNotesProps) {
  const [hour, setHour] = useState(2)
  const [playing, setPlaying] = useState(false)
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (reduced || !playing) return; const timer = setInterval(() => setHour((h) => h >= 8 ? 0 : h + 1), 1800); return () => clearInterval(timer) }, [playing, reduced])
  const weights = [Math.max(0, 1 - hour / 3), Math.min(1, hour / 4), Math.max(0.2, (hour - 2) / 6)]
  const groups = [{ label: 'Top', notes: topNotes, weight: weights[0], time: '0–2h' }, { label: 'Heart', notes: middleNotes, weight: weights[1], time: '2–4h' }, { label: 'Base', notes: baseNotes, weight: weights[2], time: '4–8h' }].filter((g) => g.notes.length)
  const setFromPointer = (clientX: number) => { const box = ref.current?.getBoundingClientRect(); if (box) setHour(Math.round(Math.max(0, Math.min(1, (clientX - box.left) / box.width)) * 8)) }
  return <section className="mt-16" aria-labelledby="fragrance-architecture"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-label mb-3 text-brand-accent">Accord architecture</p><h2 id="fragrance-architecture" className="font-display text-3xl font-light text-foreground">The invisible structure</h2></div><button type="button" onClick={() => setPlaying((v) => !v)} className="text-label text-text-muted hover:text-brand-accent">{playing ? 'Pause study' : 'Play slowly'}</button></div><div ref={ref} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e.clientX) }} onPointerMove={(e) => { if (e.buttons) setFromPointer(e.clientX) }} className="relative mb-10 cursor-ew-resize py-6" role="slider" aria-label="Fragrance wear timeline" aria-valuemin={0} aria-valuemax={8} aria-valuenow={hour} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') setHour((h) => Math.min(8, h + 1)); if (e.key === 'ArrowLeft') setHour((h) => Math.max(0, h - 1)) }}><span className="absolute -top-1 -translate-x-1/2 text-label text-brand-accent" style={{ left: `${hour / 8 * 100}%` }}>Hour {hour}</span><div className="h-px bg-hairline" /><motion.div className="absolute top-[25px] size-3 -translate-x-1/2 rounded-full border border-brand-accent bg-bg-base" animate={{ left: `${hour / 8 * 100}%` }} transition={{ duration: 0.5 }} /></div><div className="border-y border-hairline">{groups.map((group, index) => <div key={group.label} className={`grid gap-5 py-6 md:grid-cols-[8rem_1fr_auto] ${index ? 'border-t border-hairline' : ''}`}><div><p className="text-label text-brand-accent">{group.label}</p><p className="mt-2 text-xs text-text-muted">{group.time}</p></div><div className="flex flex-wrap gap-2">{group.notes.map((note) => <motion.span key={note} animate={{ opacity: 0.35 + group.weight * 0.65, scale: 0.96 + group.weight * 0.04 }} className="rounded-full border border-hairline px-3 py-2 text-label text-text-secondary">{note}</motion.span>)}</div><span className="text-xs text-text-muted">{Math.round(group.weight * 100)}% presence</span></div>)}</div><p className="mt-5 text-xs text-text-muted">Drag the line, or use arrow keys, to follow the composition from first light to lasting skin.</p></section>
}
