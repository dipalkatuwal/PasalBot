import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader } from '@/components/ui/index.jsx'
import { BotChat } from '@/components/features/bot/BotChat'
import { KeywordEditor } from '@/components/features/bot/KeywordEditor'

export default function BotPage() {
  const { loading } = useShop()

  if (loading) return (
    <PageLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)', fontSize: 14 }}>
        Loading bot settings…
      </div>
    </PageLayout>
  )

  return (
    <PageLayout>
      <SectionHeader title="🤖 Bot Builder" />
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, margin: '-0.75rem 0 1.5rem' }}>
        Customise keyword triggers and preview the bot in real time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 1rem', color: 'var(--color-text-secondary)' }}>KEYWORD TRIGGERS</h3>
          <KeywordEditor />
        </div>

        <div>
          <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 1rem', color: 'var(--color-text-secondary)' }}>LIVE PREVIEW</h3>
          <BotChat />
        </div>
      </div>
    </PageLayout>
  )
}
