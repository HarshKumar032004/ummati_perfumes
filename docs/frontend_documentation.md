# Frontend Application Documentation: Ummati Perfumes

## 1. Application Overview
Ummati Perfumes is a premium e-commerce platform selling luxury fragrances and attars. The frontend is split into two distinct experiences:
- **The Storefront (`/`)**: A highly aesthetic, immersive shopping experience for customers. It features custom 3D elements, sophisticated typography, subtle micro-animations, and a luxury design language.
- **The Admin Dashboard (`/admin`)**: A functional, dark-themed management interface for store owners to manage products, orders, and view analytics.

**Main User Roles (Frontend Perspective):**
1. **Guest/Customer**: Browses products, adds them to a cart drawer, and proceeds through a secure checkout.
2. **Administrator**: Logs into a restricted dashboard to manage the store catalog and orders.

## 2. Frontend Architecture Overview
- **Framework**: Next.js (App Router) using React 19.
- **Styling**: Tailwind CSS v4 with highly customized design tokens via CSS variables (`globals.css`).
- **UI Components**: Shadcn UI / Radix UI primitives heavily customized for the luxury aesthetic.
- **Animations**: Framer Motion for scroll transitions, page elements, and layout animations.
- **3D Graphics**: `@react-three/fiber` and `@react-three/drei` for the interactive 3D perfume bottle on the homepage.
- **State Management**: Zustand for global cart state (`useCartStore`); `next-themes` for dark/light mode toggling.

## 3. Frontend Folder Structure
```text
src/
├── app/                  → Application routes (Next.js App Router)
│   ├── (admin)/          → Admin dashboard routes and layout
│   └── (storefront)/     → Customer-facing storefront routes and layout
├── components/           → Reusable UI components
│   ├── admin/            → Admin-specific components (tables, forms)
│   ├── auth/             → Authentication components (LoginModal)
│   ├── checkout/         → Checkout-specific UI
│   ├── global/           → Global components (Navbar, Footer)
│   ├── storefront/       → Storefront components (ProductCard, Hero3D, CartDrawer)
│   └── ui/               → Base Shadcn/Radix UI components (Button, Sheet, Accordion)
├── lib/                  → Utilities, schemas, and configurations
├── store/                → Zustand state stores (useCartStore.ts)
└── types/                → TypeScript interfaces and types
```

## 4. Application Sitemap
**Storefront (Public)**
- `/` - Home
- `/shop` - Shop / Collection
- `/product/[slug]` - Product Detail Page (PDP)
- `/checkout` - Secure Checkout
- `/order/[orderNumber]` - Order Detail
- `/order/success` - Order Success Confirmation

**Admin Dashboard (Protected)**
- `/admin` - Executive Dashboard
- `/admin/products` - Product List
- `/admin/products/new` - Create Product
- `/admin/orders` - Order List
- `/admin/orders/[id]` - Order Detail

## 5. Global Layout
The application uses route groups to apply distinct layouts:
- **Root Layout (`src/app/layout.tsx`)**: Sets up the HTML body, `ThemeProvider` for dark mode, and a globally suspended `LoginModal`.
- **Storefront Layout (`(storefront)/layout.tsx`)**: Wraps pages in the global `Navbar` and `Footer`.
- **Admin Layout (`(admin)/layout.tsx`)**: Provides a dark-themed permanent desktop sidebar and a mobile header with a Radix `Sheet` for navigation.

## 6. Design System & Styling
The frontend employs a sophisticated, muted luxury design system configured via CSS variables in `globals.css` and accessed via Tailwind classes.

### Typography
- **Display Font (`font-display`)**: Cormorant Garamond. Used for large headings, page titles, and the logo. Extremely lightweight (`font-light`, `font-[300]`) with tight tracking.
- **Sans Font (`font-sans`)**: Inter. Used for body text, buttons, and utility text.
- **Labels (`text-label`)**: 10px uppercase, heavy letter-spacing (`0.25em`), font-weight 500.

### Colors
- **Backgrounds**: `--bg-base` (Main), `--bg-surface` (Cards/Sections), `--bg-elevated` (Floating elements).
- **Brand Accent**: `--brand-accent` (Gold/Bronze: `#9E7D47` in light mode, `#C8A96E` in dark mode).
- **Text**: `--text-primary` (Dark grey/off-white), `--text-secondary`, `--text-muted`.
- **Borders**: `--hairline` (Very subtle, 8% opacity border for dividers).

### Dark Mode
Implemented via `next-themes` using the `.dark` class. The storefront supports toggling (warm alabaster to smoked obsidian), while the admin dashboard is strictly dark-themed.

### Spacing & Layout
- **Container**: `.container-brand` (Max-width 1560px, responsive inline padding).
- **Borders**: Extensive use of `border-hairline` for separation rather than heavy boxes.
- **Radius**: Minimal border radius (`2px` default) to maintain a sharp, editorial feel.

## 7. Reusable Component Inventory

### Base UI (Shadcn/Radix)
- **Button (`components/ui/button.tsx`)**: Highly customized variants including `premium` (gold fill), `ghost-gold` (outlined gold), and `link` (text with underline).
- **Sheet (`components/ui/sheet.tsx`)**: Used for the Cart Drawer, Mobile Menu, and Mobile Filters.
- **Accordion (`components/ui/accordion.tsx`)**: Used on the Product Detail page for descriptions and shipping info.
- **Table (`components/ui/table.tsx`)**: Used exclusively in the admin dashboard for data-dense lists.

### Storefront Components
- **ProductCard (`ProductCard.tsx`)**: Displays product image, title, price, and a "Quick Add" hover state. Uses Framer Motion for a subtle upward float on hover.
- **Hero3D (`Hero3D.tsx`)**: An interactive 3D perfume bottle rendered with React Three Fiber. Reacts to mouse movement.
- **CartDrawer (`CartDrawer.tsx`)**: A slide-out panel from the right showing cart contents, subtotal, and checkout link.
- **Navbar (`Navbar.tsx`)**: Sticky header that transitions to a glassmorphism effect (`.glass`) on scroll.

## 8. Page-by-Page Documentation

### Page: Storefront Home
- **Route**: `/`
- **Purpose**: Brand introduction, featured products, and aesthetic immersion.
- **Structure**:
  1. **Hero Section**: Split grid. Left side has editorial text and CTAs. Right side contains the `Hero3D` component.
  2. **Feature Bar**: 4-column grid highlighting brand pillars (e.g., "Kannauj attar").
  3. **Featured Products**: A 4-column grid of `ProductCard`s.
  4. **Atelier Section**: Text overlay with a highly stylized background featuring a CSS radial gradient and floating glassmorphism card.
- **Animations**: 3D bottle follows cursor. Navbar turns to glass on scroll.

### Page: Shop (Collection)
- **Route**: `/shop`
- **Purpose**: Browse all products with filtering.
- **Structure**:
  1. **Header**: Page title and description.
  2. **Mobile Filter Trigger**: Visible only on mobile/tablet. Opens `ShopFilters` in a `Sheet`.
  3. **Desktop Sidebar**: Sticky `ShopFilters` component (`w-[240px]`).
  4. **Product Grid**: Responsive grid (2 cols mobile, 3 tablet, 4 desktop) of `ProductCard`s.

### Page: Product Detail (PDP)
- **Route**: `/product/[slug]`
- **Purpose**: Deep dive into a single fragrance and add to cart.
- **Structure**:
  1. **Breadcrumbs**: Top left navigation.
  2. **Product Gallery**: Left column (sticky on desktop).
  3. **Details Panel**: Right column (sticky on desktop). Contains title, `AddToCartForm`, `FragranceNotes` (top/middle/base visualizer), and an `Accordion` for Description, Performance, and Shipping.

### Page: Checkout
- **Route**: `/checkout`
- **Purpose**: Secure payment and order finalization.
- **Structure**:
  1. **CheckoutForm**: Left column (7/12 width). Collects shipping and payment details.
  2. **OrderSummary**: Right column (5/12 width). Shows cart items and totals.
- **Behavior**: Requires items in `useCartStore`. Redirects to `/shop` if empty. Initializes Razorpay script dynamically.

### Page: Admin Dashboard
- **Route**: `/admin`
- **Purpose**: High-level store metrics.
- **Structure**:
  1. **Metrics Row**: Three cards showing Revenue, Orders, and AOV. Dark themed with gold icons.
  2. **Recent Transactions**: A Shadcn `Table` showing the latest 5 orders.

### Page: Admin Products
- **Route**: `/admin/products`
- **Purpose**: List all products for management.
- **Structure**:
  1. **Header**: Title and "Create Product" button.
  2. **Data Table**: Shows Image thumbnail, Name, Status badge (Active/Draft), Price, and Stock.

## 9. Responsive Design & Mobile Behavior
The application is mobile-first, adapting gracefully to larger screens:
- **Breakpoints**: Tailwind defaults (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).
- **Navigation**: Desktop uses horizontal links. Mobile hides links and shows a Hamburger icon that triggers a left-side `Sheet` menu.
- **Shop Filters**: On desktop (`lg`), filters are a sticky left sidebar. On mobile, they are hidden behind a "Filters" button that opens a Radix `Sheet`.
- **Product Grid**: `grid-cols-2` on mobile, scaling up to `grid-cols-4` on desktop.
- **Admin Sidebar**: Fixed 64-width sidebar on desktop (`md:flex`). On mobile, it becomes a top header with a hamburger menu opening a left-side `Sheet`.

## 10. Animation & Interaction System
- **Hover Lift**: `ProductCard`s move up slightly (`y: -3`) on hover using Framer Motion with a custom `ease-luxury` bezier curve (`[0.22, 1, 0.36, 1]`).
- **Quick Add Reveal**: Hovering a product card reveals a glassmorphism "Quick Add" button that slides up from the bottom (`y: 0` from `110%`).
- **Links (`.luxury-link`)**: Nav links feature an animated underline that scales from the center (`scaleX(0)` to `scaleX(1)`) on hover.
- **Navbar Glass Effect**: Fades in a background blur and border when the user scrolls past 16px.
- **Theme Toggle**: The Sun/Moon icon in the navbar spins and fades using Framer Motion `AnimatePresence`.

## 11. Navigation System
- **Main Nav**: Powered by `Navbar.tsx`. Includes links to Collections, Ateliers, and Notes.
- **Cart**: Handled globally via `CartDrawer.tsx` (slides from the right).
- **Admin Nav**: Powered by the sidebar in `(admin)/layout.tsx`.

## 12. Modals, Drawers & Overlays
- **Cart Drawer**: Right-side `Sheet`. Controlled globally by `useCartStore`.
- **Mobile Menu**: Left-side `Sheet`.
- **Mobile Filters**: Left-side `Sheet` triggered on `/shop`.
- **Login Modal**: Centered `Dialog`. Rendered globally in `layout.tsx` inside a `Suspense` boundary (triggered via URL query params like `?login=true`).

## 13. Loading, Error, & Empty States
- **Skeletons**: Used heavily on the storefront. `ProductCardSkeleton` renders a pulsing gray box matching the aspect ratio of actual products.
- **Empty Cart**: Shows a large ShoppingBag icon and a prompt to "Begin with a fragrance" inside the `CartDrawer`.
- **Empty Shop**: If filters return no products, displays "No products found matching your criteria."
- **Button Loading**: Buttons have a `loading` prop that replaces content with a spinning SVG circle.

## 14. Forms & Tables
- **Checkout Form**: Built with `react-hook-form` and validated via `zod`. Includes error messages below fields.
- **Admin Tables**: Uses `@radix-ui/react-table` (via Shadcn). Features dark borders (`border-[#2A2530]`) and gold text for primary identifiers (like Order Numbers).

## 15. Frontend Coding Guidelines for Junior Developers
1. **Styling Strictness**: **DO NOT** use arbitrary Tailwind colors (e.g., `text-red-500`) on the storefront. Always use CSS variables (e.g., `text-brand-accent`, `bg-bg-surface`).
2. **Spacing**: Rely on standard Tailwind spacing. For section gaps, `py-20` to `py-40` is the standard for the editorial look.
3. **Typography**: Use `font-display` for headings and `font-sans` for everything else. Use `text-label` for small, tracked-out uppercase subtitles.
4. **Components**: Do not build new modals or drawers from scratch. Reuse `Sheet` and `Dialog` from `src/components/ui/`.
5. **Animations**: Do not add bouncy or fast animations. Use `duration-500` or `duration-700` with the custom `ease-luxury` easing curve to maintain the premium feel.
6. **State**: Use `useCartStore` for anything related to the shopping bag. Do not prop-drill cart state.

## 16. Screenshot Guide for Documentation
To complete this handoff document visually, capture the following:
1. **Storefront Homepage (Desktop)**: Capture the split hero section to show the 3D bottle and typography hierarchy.
2. **Navbar (Scrolled vs Unscrolled)**: Show the transition from solid background to the `.glass` effect.
3. **Shop Page (Desktop vs Mobile)**: Show the sticky sidebar on desktop and the "Filters" Sheet button on mobile.
4. **Product Card Hover State**: Capture the glassmorphism "Quick Add" button appearing on hover.
5. **Cart Drawer**: Capture an open cart with at least one item inside.
6. **Admin Dashboard (Desktop)**: Show the dark theme, sidebar, and metric cards.

## 17. Frontend Feature Matrix

| Feature | Page | Component | Responsive | Animation | Status |
|--------|------|-----------|------------|-----------|--------|
| 3D Hero Bottle | Home | `Hero3D` | Scales to container | Cursor tracking | Implemented |
| Dark/Light Toggle | Storefront | `ThemeToggle` | Yes | Icon rotation | Implemented |
| Quick Add to Cart | Shop / Home | `ProductCard` | Touch friendly | Slide-up reveal | Implemented |
| Mobile Filters | Shop | `Sheet` / `ShopFilters` | Sheet on Mobile | Slide from left | Implemented |
| Cart Management | Global | `CartDrawer` | Sheet on Mobile | Slide from right | Implemented |
| Accordion Details | PDP | `Accordion` | Yes | Expand/Collapse | Implemented |
| Admin Sidebar | Admin | `(admin)/layout` | Sheet on Mobile | Slide from left | Implemented |

## 18. Junior Developer Quick Reference
- **Where are global colors defined?** `src/app/globals.css`.
- **How do I open the cart programmatically?** `const { openCart } = useCartStore()`.
- **Where are UI primitives?** `src/components/ui/`.
- **How do I style a primary button?** `<Button variant="premium">Text</Button>`.
- **How do I create a new admin page?** Add a folder inside `src/app/(admin)/admin/`. It will automatically inherit the dark sidebar layout.

Frontend Application Documentation: Ummati Perfumes
1. Application Overview
Ummati Perfumes is a premium e-commerce platform selling luxury fragrances and attars. The frontend is split into two distinct experiences:

The Storefront (/): A highly aesthetic, immersive shopping experience for customers. It features custom 3D elements, sophisticated typography, subtle micro-animations, and a luxury design language.
The Admin Dashboard (/admin): A functional, dark-themed management interface for store owners to manage products, orders, and view analytics.
Main User Roles (Frontend Perspective):

Guest/Customer: Browses products, adds them to a cart drawer, and proceeds through a secure checkout.
Administrator: Logs into a restricted dashboard to manage the store catalog and orders.
2. Frontend Architecture Overview
Framework: Next.js (App Router) using React 19.
Styling: Tailwind CSS v4 with highly customized design tokens via CSS variables (globals.css).
UI Components: Shadcn UI / Radix UI primitives heavily customized for the luxury aesthetic.
Animations: Framer Motion for scroll transitions, page elements, and layout animations.
3D Graphics: @react-three/fiber and @react-three/drei for the interactive 3D perfume bottle on the homepage.
State Management: Zustand for global cart state (useCartStore); next-themes for dark/light mode toggling.
3. Frontend Folder Structure
text
src/
├── app/                  → Application routes (Next.js App Router)
│   ├── (admin)/          → Admin dashboard routes and layout
│   └── (storefront)/     → Customer-facing storefront routes and layout
├── components/           → Reusable UI components
│   ├── admin/            → Admin-specific components (tables, forms)
│   ├── auth/             → Authentication components (LoginModal)
│   ├── checkout/         → Checkout-specific UI
│   ├── global/           → Global components (Navbar, Footer)
│   ├── storefront/       → Storefront components (ProductCard, Hero3D, CartDrawer)
│   └── ui/               → Base Shadcn/Radix UI components (Button, Sheet, Accordion)
├── lib/                  → Utilities, schemas, and configurations
├── store/                → Zustand state stores (useCartStore.ts)
└── types/                → TypeScript interfaces and types
4. Application Sitemap
Storefront (Public)

/ - Home
/shop - Shop / Collection
/product/[slug] - Product Detail Page (PDP)
/checkout - Secure Checkout
/order/[orderNumber] - Order Detail
/order/success - Order Success Confirmation
Admin Dashboard (Protected)

/admin - Executive Dashboard
/admin/products - Product List
/admin/products/new - Create Product
/admin/orders - Order List
/admin/orders/[id] - Order Detail
5. Global Layout
The application uses route groups to apply distinct layouts:

Root Layout (src/app/layout.tsx): Sets up the HTML body, ThemeProvider for dark mode, and a globally suspended LoginModal.
Storefront Layout ((storefront)/layout.tsx): Wraps pages in the global Navbar and Footer.
Admin Layout ((admin)/layout.tsx): Provides a dark-themed permanent desktop sidebar and a mobile header with a Radix Sheet for navigation.
6. Design System & Styling
The frontend employs a sophisticated, muted luxury design system configured via CSS variables in globals.css and accessed via Tailwind classes.

Typography
Display Font (font-display): Cormorant Garamond. Used for large headings, page titles, and the logo. Extremely lightweight (font-light, font-[300]) with tight tracking.
Sans Font (font-sans): Inter. Used for body text, buttons, and utility text.
Labels (text-label): 10px uppercase, heavy letter-spacing (0.25em), font-weight 500.
Colors
Backgrounds: --bg-base (Main), --bg-surface (Cards/Sections), --bg-elevated (Floating elements).
Brand Accent: --brand-accent (Gold/Bronze: #9E7D47 in light mode, #C8A96E in dark mode).
Text: --text-primary (Dark grey/off-white), --text-secondary, --text-muted.
Borders: --hairline (Very subtle, 8% opacity border for dividers).
Dark Mode
Implemented via next-themes using the .dark class. The storefront supports toggling (warm alabaster to smoked obsidian), while the admin dashboard is strictly dark-themed.

Spacing & Layout
Container: .container-brand (Max-width 1560px, responsive inline padding).
Borders: Extensive use of border-hairline for separation rather than heavy boxes.
Radius: Minimal border radius (2px default) to maintain a sharp, editorial feel.
7. Reusable Component Inventory
Base UI (Shadcn/Radix)
Button (components/ui/button.tsx): Highly customized variants including premium (gold fill), ghost-gold (outlined gold), and link (text with underline).
Sheet (components/ui/sheet.tsx): Used for the Cart Drawer, Mobile Menu, and Mobile Filters.
Accordion (components/ui/accordion.tsx): Used on the Product Detail page for descriptions and shipping info.
Table (components/ui/table.tsx): Used exclusively in the admin dashboard for data-dense lists.
Storefront Components
ProductCard (ProductCard.tsx): Displays product image, title, price, and a "Quick Add" hover state. Uses Framer Motion for a subtle upward float on hover.
Hero3D (Hero3D.tsx): An interactive 3D perfume bottle rendered with React Three Fiber. Reacts to mouse movement.
CartDrawer (CartDrawer.tsx): A slide-out panel from the right showing cart contents, subtotal, and checkout link.
Navbar (Navbar.tsx): Sticky header that transitions to a glassmorphism effect (.glass) on scroll.
8. Page-by-Page Documentation
Page: Storefront Home
Route: /
Purpose: Brand introduction, featured products, and aesthetic immersion.
Structure:
Hero Section: Split grid. Left side has editorial text and CTAs. Right side contains the Hero3D component.
Feature Bar: 4-column grid highlighting brand pillars (e.g., "Kannauj attar").
Featured Products: A 4-column grid of ProductCards.
Atelier Section: Text overlay with a highly stylized background featuring a CSS radial gradient and floating glassmorphism card.
Animations: 3D bottle follows cursor. Navbar turns to glass on scroll.
Page: Shop (Collection)
Route: /shop
Purpose: Browse all products with filtering.
Structure:
Header: Page title and description.
Mobile Filter Trigger: Visible only on mobile/tablet. Opens ShopFilters in a Sheet.
Desktop Sidebar: Sticky ShopFilters component (w-[240px]).
Product Grid: Responsive grid (2 cols mobile, 3 tablet, 4 desktop) of ProductCards.
Page: Product Detail (PDP)
Route: /product/[slug]
Purpose: Deep dive into a single fragrance and add to cart.
Structure:
Breadcrumbs: Top left navigation.
Product Gallery: Left column (sticky on desktop).
Details Panel: Right column (sticky on desktop). Contains title, AddToCartForm, FragranceNotes (top/middle/base visualizer), and an Accordion for Description, Performance, and Shipping.
Page: Checkout
Route: /checkout
Purpose: Secure payment and order finalization.
Structure:
CheckoutForm: Left column (7/12 width). Collects shipping and payment details.
OrderSummary: Right column (5/12 width). Shows cart items and totals.
Behavior: Requires items in useCartStore. Redirects to /shop if empty. Initializes Razorpay script dynamically.
Page: Admin Dashboard
Route: /admin
Purpose: High-level store metrics.
Structure:
Metrics Row: Three cards showing Revenue, Orders, and AOV. Dark themed with gold icons.
Recent Transactions: A Shadcn Table showing the latest 5 orders.
Page: Admin Products
Route: /admin/products
Purpose: List all products for management.
Structure:
Header: Title and "Create Product" button.
Data Table: Shows Image thumbnail, Name, Status badge (Active/Draft), Price, and Stock.
9. Responsive Design & Mobile Behavior
The application is mobile-first,

It looks like my previous response was interrupted. Here is the continuation of the frontend documentation, picking up from where it left off:

9. Responsive Design & Mobile Behavior
The application is mobile-first, adapting gracefully to larger screens:

Breakpoints: Tailwind defaults (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).
Navigation: Desktop uses horizontal links. Mobile hides links and shows a Hamburger icon that triggers a left-side Sheet menu.
Shop Filters: On desktop (lg), filters are a sticky left sidebar. On mobile, they are hidden behind a "Filters" button that opens a Radix Sheet.
Product Grid: grid-cols-2 on mobile, scaling up to grid-cols-3 on tablet, and grid-cols-4 on desktop.
Admin Sidebar: Fixed 64-width sidebar on desktop (md:flex). On mobile, it becomes a top header with a hamburger menu opening a left-side Sheet.
10. Animation & Interaction System
Hover Lift: ProductCards move up slightly (y: -3) on hover using Framer Motion with a custom ease-luxury bezier curve ([0.22, 1, 0.36, 1]).
Quick Add Reveal: Hovering a product card reveals a glassmorphism "Quick Add" button that slides up from the bottom (y: 0 from 110%).
Links (.luxury-link): Nav links feature an animated underline that scales from the center (scaleX(0) to scaleX(1)) on hover.
Navbar Glass Effect: Fades in a background blur and border when the user scrolls past 16px.
Theme Toggle: The Sun/Moon icon in the navbar spins and fades using Framer Motion AnimatePresence.
11. Navigation System
Main Nav: Powered by Navbar.tsx. Includes links to Collections, Ateliers, and Notes.
Cart: Handled globally via CartDrawer.tsx (slides from the right).
Admin Nav: Powered by the sidebar in (admin)/layout.tsx.
12. Modals, Drawers & Overlays
Cart Drawer: Right-side Sheet. Controlled globally by useCartStore.
Mobile Menu: Left-side Sheet.
Mobile Filters: Left-side Sheet triggered on /shop.
Login Modal: Centered Dialog. Rendered globally in layout.tsx inside a Suspense boundary (triggered via URL query params like ?login=true).
13. Loading, Error, & Empty States
Skeletons: Used heavily on the storefront. ProductCardSkeleton renders a pulsing gray box matching the aspect ratio of actual products.
Empty Cart: Shows a large ShoppingBag icon and a prompt to "Begin with a fragrance" inside the CartDrawer.
Empty Shop: If filters return no products, displays "No products found matching your criteria."
Button Loading: Buttons have a loading prop that replaces content with a spinning SVG circle.
14. Forms & Tables
Checkout Form: Built with react-hook-form and validated via zod. Includes error messages below fields.
Admin Tables: Uses @radix-ui/react-table (via Shadcn). Features dark borders (border-[#2A2530]) and gold text for primary identifiers (like Order Numbers).
15. Frontend Coding Guidelines for Junior Developers
Styling Strictness: DO NOT use arbitrary Tailwind colors (e.g., text-red-500) on the storefront. Always use CSS variables (e.g., text-brand-accent, bg-bg-surface).
Spacing: Rely on standard Tailwind spacing. For section gaps, py-20 to py-40 is the standard for the editorial look.
Typography: Use font-display for headings and font-sans for everything else. Use text-label for small, tracked-out uppercase subtitles.
Components: Do not build new modals or drawers from scratch. Reuse Sheet and Dialog from src/components/ui/.
Animations: Do not add bouncy or fast animations. Use duration-500 or duration-700 with the custom ease-luxury easing curve to maintain the premium feel.
State: Use useCartStore for anything related to the shopping bag. Do not prop-drill cart state.
16. Screenshot Guide for Documentation
To complete this handoff document visually, capture the following:

Storefront Homepage (Desktop): Capture the split hero section to show the 3D bottle and typography hierarchy.
Navbar (Scrolled vs Unscrolled): Show the transition from solid background to the .glass effect.
Shop Page (Desktop vs Mobile): Show the sticky sidebar on desktop and the "Filters" Sheet button on mobile.
Product Card Hover State: Capture the glassmorphism "Quick Add" button appearing on hover.
Cart Drawer: Capture an open cart with at least one item inside.
Admin Dashboard (Desktop): Show the dark theme, sidebar, and metric cards.
17. Frontend Feature Matrix
Feature	Page	Component	Responsive	Animation	Status
3D Hero Bottle	Home	Hero3D	Scales to container	Cursor tracking	Implemented
Dark/Light Toggle	Storefront	ThemeToggle	Yes	Icon rotation	Implemented
Quick Add to Cart	Shop / Home	ProductCard	Touch friendly	Slide-up reveal	Implemented
Mobile Filters	Shop	Sheet / ShopFilters	Sheet on Mobile	Slide from left	Implemented
Cart Management	Global	CartDrawer	Sheet on Mobile	Slide from right	Implemented
Accordion Details	PDP	Accordion	Yes	Expand/Collapse	Implemented
Admin Sidebar	Admin	(admin)/layout	Sheet on Mobile	Slide from left	Implemented
18. Junior Developer Quick Reference
Where are global colors defined? src/app/globals.css.
How do I open the cart programmatically? const { openCart } = useCartStore().
Where are UI primitives? src/components/ui/.
How do I style a primary button? <Button variant="premium">Text</Button>.
How do I create a new admin page? Add a folder inside src/app/(admin)/admin/. It will automatically inherit the dark sidebar layout.