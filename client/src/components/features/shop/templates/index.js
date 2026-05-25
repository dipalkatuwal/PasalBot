// ── Template Registry ─────────────────────────────────────────────────────────
//
// This is the SINGLE source of truth for templates.
// To add a new template:
//   1. Create  src/components/features/shop/templates/YourTemplate.jsx
//   2. Export your component from it
//   3. Add one entry to TEMPLATE_REGISTRY below — done!
//      The entry appears in the Templates tab AND the shop renders it automatically.
//
// To remove a template: delete its file and remove its entry here.
//
// Fields:
//   id        — must match the value stored in the DB (user.activeTemplate)
//   name      — shown in the Templates tab card
//   desc      — subtitle on the card
//   preview   — emoji/symbol shown as a visual preview icon
//   features  — bullet list shown on the card
//   component — the React component that renders the shop (null = uses built-in default)

import { HimalayanHavenUI }   from './Haven'
import { ShantiCollectiveUI } from './Shanti'
import { KailashUI }           from './Kailash'
import { StoryShopUI }         from './Story'
import { MinimalShopUI }       from './Minimal'

export const TEMPLATE_REGISTRY = [
  {
    id:       'haven',
    name:     'Himalaya Haven',
    desc:     'Warm serif boutique — earthy amber tones, editorial feel',
    preview:  '☰',
    features: ['Serif typography & rich warmth', 'Mosaic category showcase', 'Horizontal product cards', 'Best for artisan & lifestyle brands'],
    component: HimalayanHavenUI,
  },
  {
    id:       'shanti',
    name:     'Shanti Collective',
    desc:     'Dark editorial — zinc & gold, spiritual collective energy',
    preview:  '◼',
    features: ['Dark mode zinc & yellow palette', 'Split-screen editorial hero', 'Bold cinematic product cards', 'Best for premium spiritual goods'],
    component: ShantiCollectiveUI,
  },
  {
    id:       'kailash',
    name:     'Kailash',
    desc:     'Cinematic luxury — black, gold & Playfair Display',
    preview:  '✦',
    features: ['Full-screen parallax hero', 'Dramatic product showcase', 'Legacy storytelling section', 'Best for ultra-premium collections'],
    component: KailashUI,
  },
  {
    id:       'story',
    name:     'Story',
    desc:     'Editorial storytelling layout',
    preview:  '📖',
    features: ['Full-screen story sections', 'Bold typographic hero', 'Great for lifestyle brands'],
    component: StoryShopUI,
  },
  {
    id:       'minimal',
    name:     'Minimal',
    desc:     'Clean & distraction-free',
    preview:  '—',
    features: ['Ultra-clean layout', 'Focus on products', 'Fast and lightweight'],
    component: MinimalShopUI,
  },
  // To add a new template, copy this block and fill it in:
  // {
  //   id:       'mynewtemplate',
  //   name:     'My Template',
  //   desc:     'Short description',
  //   preview:  '★',
  //   features: ['Feature one', 'Feature two'],
  //   component: MyNewTemplateUI,
  // },
]

// Used by ShopUI to render the correct component
export function getTemplate(templateId) {
  return TEMPLATE_REGISTRY.find(t => t.id === templateId)?.component || null
}

// Used by mockData (and anywhere that needs the metadata list for the UI)
export const SHOP_TEMPLATES = TEMPLATE_REGISTRY.map(({ id, name, desc, preview, features }) => ({
  id, name, desc, preview, features,
}))
