import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { useUI } from '@/context/UIContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader } from '@/components/ui/index.jsx'
import { Button } from '@/components/ui/Button'
import { ThemeCard } from '@/components/features/themes/ThemeCard'
import { SHOP_THEMES } from '@/data/mockData'

export default function ThemesPage() {
  const { activeTheme, setTheme } = useShop()
  const { openDemoShop } = useUI()
  const [pending, setPending] = useState(activeTheme.id)

  const handleApply = () => {
    const theme = SHOP_THEMES.find(t => t.id === pending)
    if (theme) setTheme(theme)
  }

  const isDirty = pending !== activeTheme.id

  return (
    <PageLayout>
      <SectionHeader title="🎨 Shop Themes" />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '-0.75rem 0 1.5rem' }}>
        Choose a theme that matches your brand. Changes apply to your live shop.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {SHOP_THEMES.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={pending === theme.id}
            onSelect={() => setPending(theme.id)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button onClick={handleApply} disabled={!isDirty}>
          {isDirty ? 'Apply Theme' : '✓ Applied'}
        </Button>
        <Button variant="secondary" onClick={() => { handleApply(); openDemoShop() }}>
          🛍️ Preview in Shop
        </Button>
        {isDirty && (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Unsaved change — click Apply to confirm.
          </span>
        )}
      </div>
    </PageLayout>
  )
}
