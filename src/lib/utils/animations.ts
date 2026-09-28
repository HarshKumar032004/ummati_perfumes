/**
 * Reusable Framer Motion animation variants
 * Import and spread these into Framer Motion `variants` props for consistency.
 *
 * Usage:
 *   <motion.div variants={fadeIn} initial="hidden" animate="visible" />
 *   <motion.ul variants={staggerContainer} initial="hidden" animate="visible">
 *     <motion.li variants={staggerItem} />
 *   </motion.ul>
 */

import { Variants } from 'framer-motion'

// ─── Fade ────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const fadeInSlow: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Slide Up (editorial text reveals) ───────────────────────────────────────

export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const slideUpSlow: Variants = {
  hidden:  { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const slideDown: Variants = {
  hidden:  { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Scale ───────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1.0] },
  },
}

// ─── Stagger Container ────────────────────────────────────────────────────────
// Wrap a list of staggerItem children in this container

export const staggerContainer: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
}

// ─── Stagger Item ─────────────────────────────────────────────────────────────
// Each child inside a staggerContainer

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const staggerItemFade: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export const heroText: Variants = {
  hidden:  { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

export const heroSubtext: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ─── Viewport preset (use with whileInView) ───────────────────────────────────
// Usage: <motion.div {...viewportOnce} variants={slideUp} />

export const viewportOnce = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-80px' },
} as const

// ─── Hover transitions (for interactive elements) ─────────────────────────────

export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.98 },
  transition: { duration: 0.15, ease: 'easeOut' },
} as const

export const hoverLift = {
  whileHover: { y: -2 },
  whileTap:   { y: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const
