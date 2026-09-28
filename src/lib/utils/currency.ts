/**
 * Currency utilities for Ummati Perfumes
 *
 * CONVENTION: All prices are stored as integers in PAISE (₹1 = 100 paise).
 * This eliminates floating-point precision bugs entirely.
 *
 * Examples:
 *   ₹1,250.00 is stored as 125000
 *   ₹999.00   is stored as 99900
 *   ₹0.00     is stored as 0
 */

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const INR_FORMATTER_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format paise integer to a display ₹ string (no decimals for whole rupees).
 * e.g., 125000 → "₹1,250"
 *       99900  → "₹999"
 */
export function formatPrice(paise: number): string {
  return INR_FORMATTER.format(paise / 100);
}

/**
 * Format paise integer to a display ₹ string (always shows 2 decimal places).
 * e.g., 125000 → "₹1,250.00"
 *       99950  → "₹999.50"
 */
export function formatPriceDecimal(paise: number): string {
  return INR_FORMATTER_DECIMAL.format(paise / 100);
}

/**
 * Convert rupees (number) to paise (integer).
 * Always rounds to nearest paisa to avoid float issues.
 * e.g., 1250    → 125000
 *       999.99  → 99999
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise (integer) to rupees (float).
 * e.g., 125000 → 1250
 *       99950  → 999.5
 */
export function toRupees(paise: number): number {
  return paise / 100;
}

/**
 * Calculate discount percentage between original and sale price (both in paise).
 * Returns a rounded integer percentage.
 * e.g., compareAtPrice=200000, price=150000 → 25 (25% off)
 */
export function discountPercent(compareAtPaise: number, salePaise: number): number {
  if (compareAtPaise <= 0 || salePaise >= compareAtPaise) return 0;
  return Math.round(((compareAtPaise - salePaise) / compareAtPaise) * 100);
}

/**
 * Calculate discount amount in paise.
 * e.g., compareAtPrice=200000, price=150000 → 50000
 */
export function discountAmount(compareAtPaise: number, salePaise: number): number {
  if (compareAtPaise <= salePaise) return 0;
  return compareAtPaise - salePaise;
}

/**
 * Apply a percentage discount to a paise price.
 * e.g., applyPercentDiscount(100000, 10) → 90000
 */
export function applyPercentDiscount(paise: number, percent: number): number {
  return Math.round(paise * (1 - percent / 100));
}

/**
 * Apply a fixed paise discount — floor at 0 (never go negative).
 * e.g., applyFixedDiscount(100000, 15000) → 85000
 */
export function applyFixedDiscount(paise: number, discountPaise: number): number {
  return Math.max(0, paise - discountPaise);
}

/**
 * Calculate shipping charge based on order subtotal (in paise).
 * Business rule: Free shipping over ₹999.
 */
export function calculateShipping(subtotalPaise: number): number {
  const FREE_SHIPPING_THRESHOLD = 99900; // ₹999 in paise
  const STANDARD_SHIPPING = 9900;        // ₹99 in paise
  return subtotalPaise >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

/**
 * Format a paise value as a compact string for display in tight spaces.
 * e.g., 125000 → "₹1.25K"
 *       100000 → "₹1K"
 */
export function formatPriceCompact(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 1000) {
    const k = rupees / 1000;
    return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `₹${rupees}`;
}
