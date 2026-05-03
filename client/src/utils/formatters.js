/**
 * Format a number as Nepali Rupees.
 * @param {number} amount
 * @param {boolean} [showSymbol=true]
 */
export function formatNPR(amount, showSymbol = true) {
  const formatted = Number(amount).toLocaleString('en-NP')
  return showSymbol ? `NPR ${formatted}` : formatted
}

/**
 * Format an ISO date string to a readable Nepali-style date.
 * @param {string} dateStr
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NP', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  })
}

/**
 * Generate a simple unique ID (client-side only).
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncate a string to `maxLen` characters, appending "…" if trimmed.
 */
export function truncate(str, maxLen = 40) {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str
}
