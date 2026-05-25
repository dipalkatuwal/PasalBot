// ── Shop Themes ───────────────────────────────────────────────────────────────
//
// To add a new theme:
//   1. Add one object to SHOP_THEMES below — done!
//
// Each theme defines a color palette that applies across ALL templates.
// The id must match the value stored in the DB (user.activeTheme).
// colors.bg    — page background
// colors.card  — card / raised surface background
// colors.accent — brand color (buttons, highlights, links)
// colors.text  — primary text color

export const SHOP_THEMES = [
  {
    id:    'mountain',
    name:  'Mountain Sunrise',
    desc:  'Warm terracotta & burnt orange',
    colors: { bg: '#FFF8F3', accent: '#D45C2A', text: '#2C1810', card: '#FEF0E7' },
  },
  {
    id:    'bazaar',
    name:  'Rangeen Bazaar',
    desc:  'Vibrant violet — festive market energy',
    colors: { bg: '#F5F0FF', accent: '#7C3AED', text: '#1E1533', card: '#EDE9FF' },
  },
  {
    id:    'himalaya',
    name:  'Himalayan Mist',
    desc:  'Cool cerulean — high-altitude calm',
    colors: { bg: '#F0F7FF', accent: '#1A6DB5', text: '#0D2340', card: '#E1EFFD' },
  },
  {
    id:    'forest',
    name:  'Rhododendron Forest',
    desc:  "Lush green — Nepal's wild highlands",
    colors: { bg: '#F2FAF2', accent: '#2D7A3A', text: '#152318', card: '#E0F5E2' },
  },
  {
    id:    'gold',
    name:  'Sacred Gold',
    desc:  'Marigold & deep saffron — temple warmth',
    colors: { bg: '#FFFBEB', accent: '#B45309', text: '#1C1008', card: '#FEF3C7' },
  },
  {
    id:    'slate',
    name:  'Midnight Slate',
    desc:  'Deep charcoal — refined & minimal',
    colors: { bg: '#F8FAFC', accent: '#334155', text: '#0F172A', card: '#E2E8F0' },
  },
  // Add a new theme by copying the block below and filling in your values:
  // {
  //   id:    'mytheme',
  //   name:  'My Theme Name',
  //   desc:  'Short description',
  //   colors: { bg: '#ffffff', accent: '#000000', text: '#111111', card: '#f5f5f5' },
  // },
]

export function getTheme(themeId) {
  return SHOP_THEMES.find(t => t.id === themeId) || SHOP_THEMES[0]
}
