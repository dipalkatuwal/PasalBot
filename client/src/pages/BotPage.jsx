import { useState } from 'react'
import { useShop } from '@/context/ShopContext'
import { PageLayout } from '@/components/layout/PageLayout'
import { SectionHeader } from '@/components/ui/index.jsx'
import { BotChat } from '@/components/features/bot/BotChat'
import { KeywordEditor } from '@/components/features/bot/KeywordEditor'

export default function BotPage() {
  const { loading } = useShop()

  // Live keyword state — KeywordEditor pushes changes here so BotChat
  // preview reflects edits instantly without a page reload
  const [liveKeywords, setLiveKeywords] = useState(null)

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
        Customize what your bot says for any customer question. Changes reflect instantly in the preview.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start',
      }}>
        {/* Left — editor */}
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 13, margin: '0 0 1rem', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Q&amp;A TRIGGERS
          </h3>
          <KeywordEditor onKeywordsChange={setLiveKeywords} />
        </div>

        {/* Right — live preview */}
        <div style={{ position: 'sticky', top: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: 13, margin: '0 0 1rem', color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            LIVE PREVIEW
          </h3>
          <BotChat overrideKeywords={liveKeywords} />
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' }}>
            This is exactly what customers see on your public shop.
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
