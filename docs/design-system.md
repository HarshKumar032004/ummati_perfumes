# Ummati Perfumes design system

## Direction

A quiet luxury system for an attar house: editorial serif headlines, restrained sans-serif UI, generous negative space, warm neutrals, and antique-gold accents. The interface should feel tactile and considered rather than glossy or over-animated.

## Tokens

- **Light base:** `#FBF9F5`; surface `#F4F0E8`; elevated `#ECE6DB`.
- **Dark base:** `#0B0A09`; surface `#141210`; elevated `#1A1815`.
- **Accent:** `#9E7D47` in light mode and `#C8A96E` in dark mode.
- **Text:** primary, secondary, and muted semantic tokens are declared in `src/app/globals.css`.
- **Hairlines:** low-opacity borders instead of heavy boxes.

## Typography

- `Cormorant Garamond` is the display face for product names, editorial headings, and large statements.
- `Inter` is the utility face for navigation, controls, metadata, and forms.
- `.text-display-2xl`, `.text-display-xl`, and `.text-display-lg` provide responsive editorial scales.
- `.text-label` is reserved for uppercase microcopy and collection metadata.

## Components

- **Buttons:** use the shared button component and semantic variants. Primary actions use the gold accent; secondary actions remain quiet and outlined.
- **Cards:** use surface color, a one-pixel hairline, and composition-led imagery. Avoid shadows unless elevation is necessary for an overlay.
- **Forms:** preserve visible labels, focus rings, and generous touch targets.
- **Navigation:** the global navbar and footer are shared across storefront routes; admin uses its own shell.
- **Motion:** `src/lib/motion.ts` and `src/lib/utils/animations.ts` centralize reveal, hover, and page-transition variants. All motion respects `prefers-reduced-motion`.

## Responsive rules

- Mobile-first layouts use flex and grid with wrapping before absolute positioning.
- Product imagery remains the visual anchor; controls stack beneath it on narrow screens.
- Tables and admin panels may scroll horizontally rather than compressing critical content.
- Touch targets should remain at least 44px high.

## Route coverage

The storefront covers home, shop, product detail, about, checkout, order success, and order detail. The admin shell covers dashboard, products, product creation, orders, and order detail. Typed demo catalog data is exposed through `src/lib/data.ts` and can be replaced by persistence without changing page consumers.

## Quality bar

Before shipping a route, check premium composition, intentional hierarchy, original content, mobile usability, loading/error states, keyboard focus, reduced motion, and image performance. Prefer one strong visual idea per section over decorative effects.
