# DESIGN_SYSTEM.md — Ummati Perfumes
## Premium Dark-Mode-First Design System

> **Philosophy**: The customer cannot smell the product. Every visual decision must compensate by evoking *luxury, warmth, and desire*. Dark-first removes visual noise and lets product photography breathe.

---

## 1. Color Tokens

### Semantic Color System (CSS Variables)

```css
:root {
  /* ── BACKGROUNDS ───────────────────────────────── */
  --color-bg-base:      #09080B;   /* Deepest layer — page background */
  --color-bg-surface:   #110F14;   /* Cards, panels on bg-base */
  --color-bg-elevated:  #1A1820;   /* Modals, dropdowns, popovers */
  --color-bg-overlay:   #231F2A;   /* Hover states on elevated */

  /* ── BRAND ACCENT — GOLD ───────────────────────── */
  --color-accent:       #C8A96E;   /* Primary brand gold */
  --color-accent-light: #E2C48A;   /* Hover, lighter states */
  --color-accent-muted: #8A7148;   /* Secondary, disabled */
  --color-accent-subtle:#C8A96E1A; /* 10% opacity gold — glow backgrounds */

  /* ── TEXT ───────────────────────────────────────── */
  --color-text-primary:  #F0E8D8;  /* Main body text — warm off-white */
  --color-text-secondary:#C0AE95;  /* Supporting text, descriptions */
  --color-text-muted:    #7A6B58;  /* Labels, placeholders, captions */
  --color-text-disabled: #4A4035;  /* Disabled state text */

  /* ── BORDERS ────────────────────────────────────── */
  --color-border:        #2A2530;  /* Default borders */
  --color-border-accent: #C8A96E40;/* Gold-tinted borders (40% opacity) */
  --color-border-focus:  #C8A96E;  /* Focus ring color */

  /* ── SEMANTIC ───────────────────────────────────── */
  --color-success:       #3D6B4F;  /* Muted green */
  --color-success-text:  #7EC89A;
  --color-error:         #6B3D3D;  /* Muted red */
  --color-error-text:    #E89A9A;
  --color-warning:       #6B5A2A;  /* Muted amber */
  --color-warning-text:  #E8C87A;
  --color-info:          #2A4A6B;
  --color-info-text:     #7AAAE8;
}
```

### Tailwind Extension (`tailwind.config.ts`)
```typescript
colors: {
  bg: {
    base:     '#09080B',
    surface:  '#110F14',
    elevated: '#1A1820',
    overlay:  '#231F2A',
  },
  accent: {
    DEFAULT: '#C8A96E',
    light:   '#E2C48A',
    muted:   '#8A7148',
    subtle:  'rgba(200, 169, 110, 0.10)',
  },
  text: {
    primary:   '#F0E8D8',
    secondary: '#C0AE95',
    muted:     '#7A6B58',
    disabled:  '#4A4035',
  },
  border: {
    DEFAULT: '#2A2530',
    accent:  'rgba(200, 169, 110, 0.25)',
    focus:   '#C8A96E',
  },
}
```

---

## 2. Typography

### Font Stack
```css
/* Display (editorial headlines) */
font-family: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;

/* UI (all functional text) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Loading (Google Fonts — Next.js `next/font/google`)
```typescript
import { Cormorant_Garamond, Inter } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
});
```

### Type Scale

| Token | Size | Line Height | Weight | Font | Usage |
|---|---|---|---|---|---|
| `display-2xl` | 72px / 4.5rem | 1.1 | 300 | Cormorant | Hero headline (desktop) |
| `display-xl` | 56px / 3.5rem | 1.15 | 300 | Cormorant | Section headlines |
| `display-lg` | 40px / 2.5rem | 1.2 | 400 | Cormorant | Product name (detail page) |
| `display-md` | 32px / 2rem | 1.25 | 400 | Cormorant | Card headlines, subheadings |
| `heading-lg` | 24px / 1.5rem | 1.3 | 500 | Inter | Admin headings, modal titles |
| `heading-md` | 20px / 1.25rem | 1.4 | 500 | Inter | Section subheadings |
| `heading-sm` | 16px / 1rem | 1.4 | 600 | Inter | Card labels, form labels |
| `body-lg` | 18px | 1.7 | 400 | Inter | Product descriptions |
| `body-md` | 16px | 1.6 | 400 | Inter | General body copy |
| `body-sm` | 14px | 1.5 | 400 | Inter | Supporting text, nav items |
| `label` | 11px | 1.2 | 600 | Inter | ALL CAPS labels, tags, badges |
| `price-lg` | 28px | 1 | 600 | Inter | Product detail price |
| `price-md` | 20px | 1 | 600 | Inter | Card price |
| `price-sm` | 14px | 1 | 500 | Inter | Cart line item price |

### Tailwind Typography Classes
```css
/* globals.css additions */
.text-display-2xl { font-family: var(--font-cormorant); font-size: 4.5rem; font-weight: 300; line-height: 1.1; }
.text-display-xl  { font-family: var(--font-cormorant); font-size: 3.5rem; font-weight: 300; line-height: 1.15; }
.text-display-lg  { font-family: var(--font-cormorant); font-size: 2.5rem; font-weight: 400; line-height: 1.2; }
.text-label       { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; }
```

---

## 3. Spacing Scale

Base unit: 4px. All spacing is multiples of 4.

```typescript
// tailwind.config.ts
spacing: {
  '0':   '0px',
  '1':   '4px',
  '2':   '8px',
  '3':   '12px',
  '4':   '16px',
  '5':   '20px',
  '6':   '24px',
  '8':   '32px',
  '10':  '40px',
  '12':  '48px',
  '16':  '64px',
  '20':  '80px',
  '24':  '96px',
  '32':  '128px',
  '40':  '160px',
  '48':  '192px',
  '64':  '256px',
}
```

### Section Spacing
- Mobile section padding: `py-16` (64px)
- Desktop section padding: `py-24` (96px) to `py-32` (128px)
- Container max-width: `max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20`

---

## 4. Breakpoints

```typescript
screens: {
  'xs':  '375px',   // Small mobile
  'sm':  '640px',   // Large mobile / small tablet
  'md':  '768px',   // Tablet
  'lg':  '1024px',  // Laptop
  'xl':  '1280px',  // Desktop
  '2xl': '1536px',  // Large desktop
}
```

### Mobile-First Grid
```
xs–sm:  1 column product grid, full-width cards
md:     2 column product grid
lg:     3 column product grid
xl+:    4 column product grid (shop page only)
```

---

## 5. Border Radius

```typescript
borderRadius: {
  'none': '0',
  'xs':   '2px',    // Tags, tiny badges
  'sm':   '4px',    // Small inputs
  'md':   '8px',    // Buttons, standard inputs
  'lg':   '12px',   // Cards
  'xl':   '16px',   // Panels, drawers
  '2xl':  '24px',   // Modals
  'full': '9999px', // Pills, circular avatars
}
```

---

## 6. Shadow / Elevation System

```css
/* From tailwind.config.ts → boxShadow */

/* sm: Subtle card lift */
shadow-sm: 0 1px 4px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)

/* md: Standard card + panels */
shadow-md: 0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)

/* lg: Modals, dropdowns */
shadow-lg: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)

/* gold: Featured items, active state glow */
shadow-gold: 0 0 0 1px rgba(200,169,110,0.3), 0 4px 24px rgba(200,169,110,0.12)

/* inner: Pressed button state */
shadow-inner: inset 0 1px 4px rgba(0,0,0,0.4)
```

---

## 7. Component Specs

### PremiumButton

```
VARIANTS:

primary (gold fill):
  background:  linear-gradient(135deg, #C8A96E, #B8954A)
  color:       #09080B (dark text on gold)
  border:      none
  hover:       background lightens → #E2C48A
  active:      scale(0.97) + shadow-inner
  disabled:    opacity-40, cursor-not-allowed
  loading:     spinner replaces text, pointer-events-none

secondary (ghost):
  background:  transparent
  border:      1px solid rgba(200,169,110,0.4)
  color:       #C8A96E
  hover:       background rgba(200,169,110,0.08) + border rgba(200,169,110,0.7)
  active:      scale(0.97)

subtle (dark fill):
  background:  #1A1820
  border:      1px solid #2A2530
  color:       #C0AE95
  hover:       background #231F2A + border rgba(255,255,255,0.08)

danger:
  background:  rgba(107,61,61,0.3)
  border:      1px solid rgba(232,154,154,0.3)
  color:       #E89A9A
  hover:       background rgba(107,61,61,0.5)

SIZES:

sm:  height 32px, px-4, text-sm, rounded-md
md:  height 44px, px-6, text-base, rounded-md    ← DEFAULT
lg:  height 56px, px-8, text-lg, rounded-md
xl:  height 64px, px-12, text-xl, rounded-lg     ← Hero CTA only

MOTION:
  transition: background 200ms ease, transform 150ms ease, box-shadow 200ms ease
  focus-visible: ring-2 ring-accent ring-offset-2 ring-offset-bg-base
```

### ProductCard

```
Container:
  background:  bg-surface (#110F14)
  border:      1px solid border-DEFAULT (#2A2530)
  border-radius: rounded-lg (12px)
  overflow:    hidden
  transition:  border-color 300ms, shadow 300ms
  hover:       border-color → border-accent + shadow-gold

Image container:
  aspect-ratio: 3/4 (portrait — perfume bottles)
  background:  bg-overlay (#231F2A)
  overflow:    hidden

  Image hover: scale(1.04) transition 400ms ease-out

Badges (on image, top-left):
  "New"       background: accent (gold) text: bg-base
  "Bestseller" background: bg-elevated text: accent border: border-accent
  "Sale"      background: error-muted text: error-text

Content padding: p-4

Product name: text-display-md (Cormorant), text-primary
Short desc:   text-body-sm, text-secondary, 2-line clamp

Price row:
  Current:     text-price-md, text-accent (gold)
  Compare-at:  text-body-sm, text-muted, line-through, ml-2

Rating:       Stars (filled=accent, empty=border), text-body-sm text-muted

CTA row:
  Add to Cart: primary button sm, full-width on mobile, auto on desktop
  Appears on:  hover (desktop) or always (mobile)
```

### Navigation

```
Navbar:
  position:   sticky top-0, z-50
  background: rgba(9,8,11,0.85) backdrop-blur-xl (glassmorphism)
  border-bottom: 1px solid rgba(255,255,255,0.04)
  height:     64px (mobile) / 72px (desktop)

Logo: Cormorant Garamond 24px, text-accent, letter-spacing tight

Nav links (desktop):
  text-body-sm, text-secondary
  hover: text-primary + underline text-accent

Cart icon:
  Count badge: bg-accent text-bg-base rounded-full 16x16

Mobile nav: Full-screen drawer from right
  background: bg-base
  Links: text-display-md Cormorant, stacked vertically
  Animation: slide-in from right, 300ms ease-out
```

---

## 8. Animation Principles

### Duration Tokens
```typescript
const duration = {
  instant:  0,      // No animation (prefers-reduced-motion)
  micro:    150,    // Micro-interactions: button press, checkbox
  fast:     200,    // Hover state transitions
  standard: 300,    // Panel open/close, modal appear
  slow:     500,    // Page transitions, hero entrance
  deliberate: 800,  // Signature brand animations (section reveal)
};
```

### Easing
```css
--ease-out:    cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Entrances */
--ease-in:     cubic-bezier(0.55, 0.05, 0.68, 0.19); /* Exits */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1.0);  /* Subtle spring for interactive elements */
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Framer Motion Patterns
```typescript
// Section entrance (used on all homepage sections)
const sectionVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
};

// Staggered card grid
const gridVariants = {
  visible: { transition: { staggerChildren: 0.08 } }
};

// Card entrance
const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};
```

---

## 9. 3D Performance Constraints

### Hero Bottle (React Three Fiber)

```typescript
// Rules:
// 1. Lazy load with dynamic import (no SSR)
const HeroBottle3D = dynamic(() => import('./HeroBottle3D'), {
  ssr: false,
  loading: () => <StaticBottleImage />,  // Immediate fallback
});

// 2. Only render if WebGL is supported
const { supportsWebGL } = useWebGL();
if (!supportsWebGL) return <StaticBottleImage />;

// 3. Disable on mobile (< md breakpoint) — use static image instead
const isMobile = useMediaQuery('(max-width: 768px)');
if (isMobile) return <StaticBottleImage />;

// 4. Respect prefers-reduced-motion
const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
// Pass to animation: if prefersReduced, show static pose

// 5. Canvas settings for performance
<Canvas
  dpr={[1, 1.5]}          // Cap pixel ratio at 1.5 (not 2)
  performance={{ min: 0.5 }} // Allow R3F to reduce quality if framerate drops
  gl={{ antialias: false, powerPreference: 'high-performance' }}
>

// 6. Model budget
// Max poly count for hero bottle: 15,000 triangles
// Max texture size: 1024x1024 (use Draco compression for GLTF)
// Target: 60fps on mid-range laptop, 30fps acceptable on low-end
```

### WebGL Detection (`hooks/useWebGL.ts`)
```typescript
export function useWebGL() {
  const [supportsWebGL, setSupportsWebGL] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setSupportsWebGL(!!gl);
    } catch {
      setSupportsWebGL(false);
    }
  }, []);

  return { supportsWebGL };
}
```
