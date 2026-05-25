import { useUI } from '@/context/UIContext'
import { useShop } from '@/context/ShopContext'

export function DemoShop() {
  const { demoShopOpen, closeDemoShop } = useUI()
  const { shop, activeTheme, activeTemplate } = useShop()

  const shopUrl = `/shop/${shop?.slug}`
  const openFullScreen = () => window.open(shopUrl, '_blank')

  // Re-mount the iframe whenever theme, template, or shop details change
  // so the preview always reflects the latest saved settings without a manual refresh.
  const iframeKey = [shop?.slug, activeTheme?.id, activeTemplate?.id, shop?.name, shop?.logo, shop?.logoUrl].join('|')

  return (
    <div style={{ display: demoShopOpen ? 'contents' : 'none' }}>
      <>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%) scale(0.9); opacity: 0; }
            to   { transform: translateX(0) scale(1); opacity: 1; }
          }
          .demo-phone-overlay {
            position: fixed; inset: 0; z-index: 2000;
            pointer-events: none;
            display: flex; align-items: flex-end; justify-content: flex-end;
          }
          @media (min-width: 700px) {
            .demo-phone-overlay { top: 90px; right: 30px; bottom: 30px; left: auto; width: auto; align-items: flex-start; }
            .demo-phone-frame { width: 390px !important; height: 100% !important; border-radius: 48px !important; padding: 12px !important; border: 4px solid #1a1a1a !important; }
            .demo-phone-content { border-radius: 36px !important; }
            .demo-phone-actions { top: -45px !important; right: 12px !important; bottom: auto !important; left: auto !important; width: auto !important; padding: 0 !important; background: transparent !important; border-top: none !important; justify-content: flex-end !important; }
            .demo-phone-notch { display: block !important; }
            .demo-phone-indicator { display: block !important; }
            .demo-phone-backdrop { display: none !important; }
          }
          @media (max-width: 699px) {
            .demo-phone-frame { width: 100% !important; height: 92dvh !important; border-radius: 28px 28px 0 0 !important; padding: 0 !important; border: none !important; border-top: 3px solid #444 !important; }
            .demo-phone-content { border-radius: 26px 26px 0 0 !important; }
            .demo-phone-actions { position: fixed !important; bottom: 92dvh !important; top: auto !important; left: 0 !important; right: 0 !important; width: 100% !important; padding: 8px 16px !important; background: var(--color-bg-raised, #fff) !important; border-top: 1px solid var(--color-border, #e5e4e7) !important; justify-content: space-between !important; box-shadow: 0 -4px 20px rgba(0,0,0,0.1) !important; }
            .demo-phone-notch { display: none !important; }
            .demo-phone-indicator { display: none !important; }
          }
        `}</style>

        {/* Backdrop (mobile only) */}
        <div className="demo-phone-backdrop" onClick={closeDemoShop}
          style={{ position: 'fixed', inset: 0, zIndex: 1999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        />

        <div className="demo-phone-overlay">

          {/* Action buttons */}
          <div className="demo-phone-actions"
            style={{ position: 'absolute', display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto', zIndex: 10 }}
          >
            <button onClick={openFullScreen} style={{ background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <span>Full Screen</span><span>↗️</span>
            </button>
            <button onClick={closeDemoShop} style={{ background: 'var(--color-bg-raised)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>✕</button>
          </div>

          {/* Phone frame */}
          <div className="demo-phone-frame"
            style={{ background: '#000', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)', position: 'relative', display: 'flex', flexDirection: 'column', pointerEvents: 'auto', animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Notch */}
            <div className="demo-phone-notch" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 24, background: '#000', borderRadius: '0 0 16px 16px', zIndex: 1001 }} />

            {/* iframe — has its own viewport so @media queries fire at 390px, exactly like a real phone */}
            <div className="demo-phone-content" style={{ flex: 1, position: 'relative' }}>
              <iframe
                key={iframeKey}
                src={shopUrl}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title="Shop Preview"
              />
            </div>

            {/* Home indicator */}
            <div className="demo-phone-indicator" style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '10px auto 4px' }} />
          </div>

        </div>
      </>
    </div>
  )
}
