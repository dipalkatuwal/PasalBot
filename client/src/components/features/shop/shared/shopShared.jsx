import { useState, useRef, useEffect, useCallback } from 'react'

// ── Product image helper — shows uploaded photo or emoji fallback ─────────────
export function ProductImg({ product, size = 64, borderRadius = 12, fontSize, bg }) {
  const [imgError, setImgError] = useState(false)
  const emojiSize = fontSize || Math.round(size * 0.5)

  // Reset error state whenever the imageUrl changes (e.g. after an edit)
  useEffect(() => { setImgError(false) }, [product.imageUrl])

  if (product.imageUrl && !imgError) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        style={{
          width: size, height: size, objectFit: 'contain',
          borderRadius, display: 'block', flexShrink: 0,
          background: bg || 'transparent',
        }}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: bg || 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: emojiSize, flexShrink: 0,
    }}>
      {product.image || '📦'}
    </div>
  )
}

// ── Full-width product image (for card headers) ───────────────────────────────
export function ProductImgFull({ product, height, bg, fontSize = 72, borderRadius = 0, children }) {
  const [imgError, setImgError] = useState(false)

  // Reset error state whenever the imageUrl changes (e.g. after an edit)
  useEffect(() => { setImgError(false) }, [product.imageUrl])

  if (product.imageUrl && !imgError) {
    return (
      <div style={{ height, position: 'relative', overflow: 'hidden', borderRadius, background: bg || '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          onError={() => setImgError(true)}
        />
        {children}
      </div>
    )
  }
  return (
    <div style={{ height, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize, position: 'relative', borderRadius }}>
      {product.image || '📦'}
      {children}
    </div>
  )
}

// ── Shop logo — image or emoji fallback ──────────────────────────────────────
export function ShopLogo({ shop, size = 40, borderRadius = 12, bg, fontSize }) {
  const [imgError, setImgError] = useState(false)
  const fs = fontSize || Math.round(size * 0.55)
  if (shop.logoUrl && !imgError) {
    return (
      <img
        src={shop.logoUrl}
        alt={shop.name}
        style={{ width: size, height: size, borderRadius, objectFit: 'cover', display: 'block', flexShrink: 0 }}
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius, background: bg || 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, flexShrink: 0 }}>
      {shop.logo || '🏪'}
    </div>
  )
}

// ── Social links bar — proper SVG icons, clickable ────────────────────────────
export function SocialBar({ shop, size = 22, style = {} }) {
  const links = []
  if (shop.socialLinks?.instagram) {
    const href = shop.socialLinks.instagram.startsWith('http')
      ? shop.socialLinks.instagram
      : `https://instagram.com/${shop.socialLinks.instagram.replace('@', '')}`
    links.push({ href, label: 'Instagram', color: '#E1306C', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )})
  }
  if (shop.socialLinks?.facebook) {
    const href = shop.socialLinks.facebook.startsWith('http')
      ? shop.socialLinks.facebook
      : `https://facebook.com/${shop.socialLinks.facebook}`
    links.push({ href, label: 'Facebook', color: '#1877F2', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )})
  }
  if (shop.whatsapp) {
    const num = shop.whatsapp.replace(/\D/g, '')
    links.push({ href: `https://wa.me/${num}`, label: 'WhatsApp', color: '#25D366', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    )})
  }
  if (shop.website) {
    const href = shop.website.startsWith('http') ? shop.website : `https://${shop.website}`
    links.push({ href, label: 'Website', color: '#6366f1', icon: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    )})
  }
  if (!links.length) return null
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', ...style }}>
      {links.map(({ href, label, color, icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
          style={{ color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

// ── Mini bot for the public shop (runs without auth/context) ─────────────────
// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) { return Number(n).toLocaleString() }

function matchProduct(products, lower) {
  return products.filter(p => {
    const pName = p.name.toLowerCase()
    const words = pName.split(/\s+/).filter(w => w.length > 2)
    return (
      lower.includes(pName) ||
      pName.includes(lower) ||
      words.some(w => lower.includes(w)) ||
      (p.category && lower.includes(p.category.toLowerCase()))
    )
  })
}

function productCard(p) {
  const stockLine = p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Out of stock'
  const cat = p.category && p.category !== 'General' ? `🏷️ ${p.category}` : ''
  const desc = p.description ? `📝 ${p.description}` : ''
  return [
    `${p.image || '📦'} *${p.name}*`,
    `💰 NPR ${fmt(p.price)} · ${stockLine}`,
    cat, desc,
  ].filter(Boolean).join('\n')
}

function deliveryBlock(shop) {
  const methods = Array.isArray(shop.paymentMethods) ? shop.paymentMethods.join(', ') : 'COD'
  const freeMsg = shop.freeDeliveryThreshold > 0
    ? `🎁 Free delivery on orders over NPR ${fmt(shop.freeDeliveryThreshold)}`
    : ''
  return [
    `🚚 *Delivery Info*`,
    `⏱️ Time: ${shop.deliveryTime || '1-3 business days'}`,
    `📦 Areas: ${shop.deliveryAreas || 'Inside Kathmandu Valley'}`,
    `💳 Payment: ${methods}`,
    freeMsg,
    `📞 We call before delivery`,
  ].filter(Boolean).join('\n')
}

function renderCart(cart, shop) {
  if (cart.length === 0) return `🛒 Your cart is empty.\n\nType a product name to add items, or type *products* to browse!`
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const lines = cart.map((i, idx) =>
    `${idx + 1}. ${i.image || '📦'} *${i.name}* × ${i.qty} = NPR ${fmt(i.price * i.qty)}`
  )
  const freeDelivery = shop.freeDeliveryThreshold > 0 && total >= shop.freeDeliveryThreshold
  const freeMsg = freeDelivery
    ? `\n🎁 You qualify for free delivery!`
    : shop.freeDeliveryThreshold > 0
      ? `\n💡 Add NPR ${fmt(shop.freeDeliveryThreshold - total)} more for free delivery`
      : ''
  return `🛒 *Your Cart (${cart.length} item${cart.length > 1 ? 's' : ''})*\n\n${lines.join('\n')}\n\n💰 Total: NPR ${fmt(total)}${freeMsg}\n\nType *checkout* to place your order, *clear cart* to start over, or *remove [item]* to remove something.`
}

// ─── Public-shop bot hook ─────────────────────────────────────────────────────
// Receives raw data props (no ShopContext — public shop is unauthenticated).
// onOrderComplete(orderData) → must call the API and save the order.

export function usePubBot(keywords = [], products = [], onOrderComplete, shop = {}, initialCart = []) {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 Welcome to *${shop.name || 'the shop'}*!\n\nI can help you:\n🛍️ Browse products & categories\n💰 Check prices & stock\n🛒 Add to cart & checkout\n🚚 Delivery & returns info\n📞 Contact the shop\n\nType *help* for all commands!`,
    },
  ])
  const [step,     setStep]     = useState(null)
  const [data,     setData]     = useState({})

  // Seed cart from initialCart (items added on the shop page before opening chat)
  // Convert initialCart format (has _id, qty) to bot cart format
  const seedCart = initialCart.map(i => ({
    name: i.name, price: i.price, image: i.image || '📦', qty: i.qty || 1
  }))
  const [cart, setCart] = useState(seedCart)
  const lastList = useRef([])

  // If the user opened chat from "Place Order via Chat" with items already in cart,
  // immediately show the cart and prompt checkout
  const didAutoPrompt = useRef(false)
  useEffect(() => {
    if (didAutoPrompt.current) return
    if (seedCart.length > 0) {
      didAutoPrompt.current = true
      setTimeout(() => {
        const total = seedCart.reduce((s, i) => s + i.price * i.qty, 0)
        const lines = seedCart.map((i, idx) =>
          `${idx + 1}. ${i.image} *${i.name}* × ${i.qty} = NPR ${fmt(i.price * i.qty)}`
        ).join('\n')
        setMessages(m => [...m, {
          from: 'bot',
          text: `I see you have items ready to order! 🛍️\n\n${lines}\n\n💰 Total: NPR ${fmt(total)}\n\nType *checkout* to place your order, or keep browsing!`,
          id: Date.now(),
        }])
      }, 500)
    }
  }, [])

  const push = useCallback((from, text) =>
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }]),
  [])

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.name === product.name)
      if (existing) return prev.map(i => i.name === product.name ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { name: product.name, price: product.price, image: product.image || '📦', qty }]
    })
  }

  function getCartTotal(cartSnapshot) {
    return (cartSnapshot || cart).reduce((s, i) => s + i.price * i.qty, 0)
  }

  const send = useCallback((text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase().trim()

    setTimeout(async () => {

      // ── Order flow ──────────────────────────────────────────────────────────

      if (step === 'product') {
        const numMatch = lower.match(/^(\d+)$/)
        let found = null
        if (numMatch) found = lastList.current[parseInt(numMatch[1], 10) - 1] || null
        if (!found) found = matchProduct(products, lower)[0] || null
        if (!found) {
          push('bot', `I couldn't find that. Here's what we have:\n\n${products.slice(0, 8).map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}\n\nType a name or number to select.`)
          lastList.current = products.slice(0, 8)
          return
        }
        if (found.stock <= 0) {
          push('bot', `Sorry, *${found.name}* is currently out of stock. 😔\n\nHere's what's available:\n\n${products.filter(p => p.stock > 0).map(p => `• ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}`)
          return
        }
        setData(d => ({ ...d, product: found.name, amount: found.price, productImage: found.image }))
        setStep('name')
        push('bot', `Great choice! ${found.image} *${found.name}* — NPR ${fmt(found.price)}\n\nWhat's your full name?`)
        return
      }

      if (step === 'name') {
        setData(d => ({ ...d, name: text.trim() }))
        setStep('address')
        push('bot', `Thank you, ${text.trim()}! 🙏\n\nWhat's your delivery address? (Include district/city)`)
        return
      }

      if (step === 'address') {
        setData(d => ({ ...d, address: text.trim() }))
        setStep('phone')
        push('bot', `Got it! 📍 Last step — what's your phone number?\n(We'll call before delivery)`)
        return
      }

      if (step === 'phone') {
        const phone = text.trim()
        const finalData = { ...data, phone }
        const isCartCheckout = finalData.cartCheckout && cart.length > 0
        const productLine = isCartCheckout
          ? cart.map(i => `${i.name} ×${i.qty}`).join(', ')
          : (finalData.product || 'General Order')
        const totalAmount = isCartCheckout
          ? getCartTotal()
          : (finalData.amount || 0)

        setStep(null)
        setData({})
        try {
          await onOrderComplete({
            customer: finalData.name,
            phone,
            address: finalData.address,
            product: productLine,
            amount:  totalAmount,
          })
          if (isCartCheckout) setCart([])
          push('bot', [
            `✅ *Order Confirmed!*`,
            ``,
            `📦 ${isCartCheckout ? 'Items' : 'Product'}: ${productLine}`,
            `👤 Name: ${finalData.name}`,
            `📍 Address: ${finalData.address}`,
            `📞 Phone: ${phone}`,
            `💰 Total: NPR ${fmt(totalAmount)}`,
            `💳 Payment: Cash on Delivery`,
            ``,
            deliveryBlock(shop),
            ``,
            `Thank you for shopping at *${shop.name || 'our shop'}*! 🙏`,
          ].join('\n'))
        } catch {
          push('bot', `Sorry, something went wrong saving your order.\n\nPlease contact us directly:\n${shop.phone ? `📞 ${shop.phone}` : ''}\n${shop.whatsapp ? `💬 WhatsApp: ${shop.whatsapp}` : ''}`.trim())
        }
        return
      }

      // ── Keyword triggers (seller-defined) ───────────────────────────────────
      const kwMatch = keywords.find(k => {
        const triggers = k.trigger.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        return triggers.some(t => lower.includes(t))
      })
      if (kwMatch) { push('bot', kwMatch.reply); return }

      // ── Cart commands ───────────────────────────────────────────────────────

      if (/\b(cart|basket|bag|my items|my cart)\b/.test(lower)) {
        push('bot', renderCart(cart, shop))
        return
      }

      if (/\b(checkout|check out|place order|confirm order|buy now|pay)\b/.test(lower)) {
        if (cart.length === 0) {
          push('bot', `Your cart is empty! 🛒\n\nBrowse our products first — type *products* or ask for a category.`)
          return
        }
        setData({ cartCheckout: true })
        setStep('name')
        push('bot', `Let's complete your order! 🛍️\n\n${renderCart(cart, shop)}\n\n---\nWhat's your full name?`)
        return
      }

      if (/\b(clear cart|empty cart|reset cart|remove all)\b/.test(lower)) {
        setCart([])
        push('bot', `🗑️ Cart cleared! Type *products* to browse.`)
        return
      }

      if (/\b(remove|delete|take out)\b/.test(lower) && !/\ball\b/.test(lower)) {
        const toRemove = cart.find(i => lower.includes(i.name.toLowerCase().split(' ')[0].toLowerCase()))
        if (toRemove) {
          setCart(prev => prev.filter(i => i.name !== toRemove.name))
          push('bot', `✅ Removed *${toRemove.name}* from your cart.`)
        } else {
          push('bot', `I couldn't find that item in your cart.\n\n${renderCart(cart, shop)}`)
        }
        return
      }

      // "add [qty] [product] to cart"
      const addMatch = lower.match(/\badd(?:\s+(\d+))?\s+(.+?)(?:\s+to\s+(?:cart|bag|basket))?$/)
      if (addMatch) {
        const qty = parseInt(addMatch[1] || '1', 10)
        const namePart = addMatch[2].replace(/\bto\s+(cart|bag|basket)\b/, '').trim()
        const numRef = namePart.match(/^(\d+)$/)
        let product = null
        if (numRef) product = lastList.current[parseInt(numRef[1], 10) - 1] || null
        else product = matchProduct(products, namePart)[0] || null

        if (product) {
          if (product.stock <= 0) {
            push('bot', `Sorry, *${product.name}* is out of stock. 😔`)
            return
          }
          addToCart(product, qty)
          push('bot', `✅ *${qty} × ${product.name}* added to cart!\n\nType *cart* to review or continue shopping.`)
        } else {
          const suggestions = matchProduct(products, namePart.split(' ')[0])
          push('bot', suggestions.length > 0
            ? `Did you mean:\n\n${suggestions.map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}\n\nType *add [number]* to add.`
            : `I couldn't find that product. Type *products* to see everything.`)
          if (suggestions.length > 0) lastList.current = suggestions
        }
        return
      }

      // ── Product detail ──────────────────────────────────────────────────────

      const detailTrigger = /\b(about|details?|info|more|describe|what is|tell me)\b/.test(lower) || lower.match(/^#?(\d+)$/)
      if (detailTrigger) {
        const numRef = lower.match(/^#?(\d+)$/)
        let target = null
        if (numRef) target = lastList.current[parseInt(numRef[1], 10) - 1] || null
        else target = matchProduct(products, lower)[0] || null
        if (target) {
          const inCart = cart.find(i => i.name === target.name)
          push('bot', [
            productCard(target),
            ``,
            inCart ? `🛒 You have ${inCart.qty} in your cart.` : '',
            `Type *add ${target.name}* to add to cart, or *order* to buy directly.`,
          ].filter(Boolean).join('\n'))
          return
        }
      }

      // ── Greeting ────────────────────────────────────────────────────────────

      if (/\b(hello|hi|hey|namaste|namaskar|sup|good morning|good evening|greetings)\b/.test(lower)) {
        push('bot', [
          `Namaste! 🙏 How can I help you today?`,
          ``,
          `• 🛍️ *products* — see all items`,
          `• 🏷️ *categories* — browse by type`,
          `• 💰 *price [item]* — check a price`,
          `• 🛒 *cart* — your cart`,
          `• 📞 *contact* — reach us`,
          `• 🚚 *delivery* — shipping info`,
          `• ❓ *help* — all commands`,
        ].join('\n'))
        return
      }

      // ── Help ────────────────────────────────────────────────────────────────

      if (/\b(help|commands|what can you do|options|guide)\b/.test(lower)) {
        push('bot', [
          `🤖 *Shop Assistant Help*`,
          ``,
          `*Shopping*`,
          `• products — see everything`,
          `• [category name] — filter by type`,
          `• price [item] — check price`,
          `• stock [item] — check availability`,
          `• search [item] — find a product`,
          `• new / latest — newest arrivals`,
          `• cheap / budget — most affordable`,
          `• compare [A] vs [B] — compare items`,
          ``,
          `*Cart*`,
          `• add [item] to cart — add item`,
          `• cart — view your cart`,
          `• checkout — place your order`,
          `• remove [item] — remove from cart`,
          `• clear cart — start over`,
          ``,
          `*Info*`,
          `• shop info — about this shop`,
          `• contact — phone, social, WhatsApp`,
          `• delivery — shipping details`,
          `• payment — payment methods`,
          `• return policy — returns & refunds`,
          `• hours — business hours`,
        ].join('\n'))
        return
      }

      // ── Categories ──────────────────────────────────────────────────────────

      if (/\b(categor|section|type|department)\b/.test(lower)) {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean).filter(c => c !== 'General'))]
        if (cats.length === 0) {
          push('bot', `No categories set up yet. Type *products* to see everything.`)
        } else {
          push('bot', `🏷️ *Browse by Category*\n\n${cats.map(c => `• ${c}`).join('\n')}\n\nType any category name to filter products!`)
        }
        return
      }

      // Category filter
      const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
      const matchedCat = cats.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower))
      if (matchedCat) {
        const catProds = products.filter(p => p.category === matchedCat)
        if (catProds.length > 0) {
          lastList.current = catProds
          push('bot', [
            `🏷️ *${matchedCat}* (${catProds.length} item${catProds.length !== 1 ? 's' : ''})`,
            ``,
            catProds.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n'),
            ``,
            `Type a number for details, or *add [item]* to cart.`,
          ].join('\n'))
          return
        }
      }

      // ── Price ───────────────────────────────────────────────────────────────

      if (/\b(price|rate|cost|kati|paisa|kitna|how much|rates|worth)\b/.test(lower)) {
        const query = lower.replace(/\b(price|rate|cost|kati|paisa|kitna|how much|rates|worth|of|the|for)\b/g, '').trim()
        const matched = query.length > 1 ? matchProduct(products, query) : []
        if (matched.length > 0) {
          lastList.current = matched
          push('bot', matched.map(p => productCard(p)).join('\n\n'))
        } else {
          lastList.current = products
          push('bot', `💰 *Price List*\n\n${products.map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}`)
        }
        return
      }

      // ── Stock ───────────────────────────────────────────────────────────────

      if (/\b(stock|available|left|baki|cha|availability|in stock|out of stock)\b/.test(lower)) {
        const query = lower.replace(/\b(stock|available|left|baki|cha|availability|in stock|out of stock|is|any|the)\b/g, '').trim()
        const matched = query.length > 1 ? matchProduct(products, query) : []
        const list = matched.length > 0 ? matched : products
        push('bot', `📦 *Stock Availability*\n\n${list.map(p =>
          `${p.image} *${p.name}*: ${p.stock > 0 ? `✅ ${p.stock} available` : '❌ Out of stock'}`
        ).join('\n')}`)
        return
      }

      // ── Product list ─────────────────────────────────────────────────────────

      if (/\b(products?|items?|list|show|all|what do you sell|catalog|menu|everything|what.+have)\b/.test(lower)) {
        if (products.length === 0) {
          push('bot', `No products are live yet. Check back soon!`)
        } else {
          lastList.current = products
          push('bot', [
            `🛍️ *Full Catalog* (${products.length} items)`,
            ``,
            products.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n'),
            ``,
            `Type a number or name for details · *add [item]* to cart · *checkout* when ready`,
          ].join('\n'))
        }
        return
      }

      // ── New / latest ────────────────────────────────────────────────────────

      if (/\b(new|latest|recent|just added|arrived|fresh)\b/.test(lower)) {
        const newest = [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5)
        lastList.current = newest
        push('bot', `🆕 *Latest Arrivals*\n\n${newest.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}\n\nType a number for details.`)
        return
      }

      // ── Budget / cheap ───────────────────────────────────────────────────────

      if (/\b(cheap|budget|affordable|lowest|cheapest|under|less than)\b/.test(lower)) {
        const priceLimit = lower.match(/(?:under|less than|below)\s*(?:npr\s*)?([\d,]+)/)
        const limit = priceLimit ? parseInt(priceLimit[1].replace(/,/g, ''), 10) : Infinity
        const sorted = [...products].filter(p => p.price <= limit).sort((a, b) => a.price - b.price).slice(0, 6)
        lastList.current = sorted
        push('bot', sorted.length > 0
          ? `💸 *Budget-Friendly Picks*\n\n${sorted.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}`
          : `No products found under that price.`)
        return
      }

      // ── Compare ─────────────────────────────────────────────────────────────

      if (/\b(compare|vs|versus|difference|which is better|which one)\b/.test(lower)) {
        const vsMatch = lower.match(/(.+?)\s+(?:vs\.?|versus|or|and)\s+(.+)/)
        if (vsMatch) {
          const a = matchProduct(products, vsMatch[1].trim())[0]
          const b = matchProduct(products, vsMatch[2].trim())[0]
          if (a && b) {
            push('bot', [
              `⚖️ *Comparison*`,
              ``,
              productCard(a),
              ``,
              productCard(b),
              ``,
              a.price < b.price ? `💡 *${a.name}* is NPR ${fmt(b.price - a.price)} cheaper.`
                : a.price > b.price ? `💡 *${b.name}* is NPR ${fmt(a.price - b.price)} cheaper.`
                : `💡 Both are the same price!`,
            ].join('\n'))
            return
          }
        }
        push('bot', `Try: *compare [product A] vs [product B]*`)
        return
      }

      // ── Search ───────────────────────────────────────────────────────────────

      if (/\b(search|find|looking for|do you have|got any|have you)\b/.test(lower)) {
        const query = lower.replace(/\b(search|find|looking for|do you have|got any|have you|any|for)\b/g, '').trim()
        const results = matchProduct(products, query)
        if (results.length > 0) {
          lastList.current = results
          push('bot', `🔍 *Results for "${query}"*\n\n${results.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}\n\nType a number or *add [item]* to cart.`)
        } else {
          push('bot', `😔 No results for "${query}".\n\nType *products* to see everything.`)
        }
        return
      }

      // ── Delivery ────────────────────────────────────────────────────────────

      if (/\b(delivery|deliver|shipping|ship|dispatch|arrive|when|kati din|days|how long)\b/.test(lower)) {
        push('bot', deliveryBlock(shop))
        return
      }

      // ── Payment ─────────────────────────────────────────────────────────────

      if (/\b(payment|pay|cash|cod|online|esewa|khalti|card|bank)\b/.test(lower)) {
        const methods = Array.isArray(shop.paymentMethods) ? shop.paymentMethods : ['COD']
        push('bot', [
          `💳 *Payment Options*`,
          ``,
          methods.map(m => `✅ ${m}`).join('\n'),
          shop.freeDeliveryThreshold > 0 ? `\n🎁 Free delivery on orders over NPR ${fmt(shop.freeDeliveryThreshold)}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ── Return policy ────────────────────────────────────────────────────────

      if (/\b(return|refund|exchange|policy|replace|broken|damaged|wrong)\b/.test(lower)) {
        push('bot', [
          `🔄 *Return & Exchange Policy*`,
          ``,
          shop.returnPolicy || 'Return/exchange within 3 days of delivery.',
          ``,
          `To initiate a return, contact us:`,
          shop.phone ? `📞 ${shop.phone}` : '',
          shop.whatsapp ? `💬 WhatsApp: ${shop.whatsapp}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ── How to order ─────────────────────────────────────────────────────────

      if (/\b(how to order|how do i order|ordering|process|steps)\b/.test(lower)) {
        push('bot', [
          `📋 *How to Order*`,
          ``,
          shop.howToOrder || 'Order via the shop bot or DM us.',
          ``,
          `*Order via Bot (right here!):*`,
          `1. Type *products* to browse`,
          `2. Type *add [item]* to add to cart`,
          `3. Type *cart* to review`,
          `4. Type *checkout* to place order`,
          `5. Provide name, address & phone`,
          `6. Done! We call before delivery ✅`,
        ].filter(Boolean).join('\n'))
        return
      }

      // ── Contact ─────────────────────────────────────────────────────────────

      if (/\b(contact|reach|call|phone|number|whatsapp|social|facebook|instagram|dm|message us)\b/.test(lower)) {
        const hasContact = shop.phone || shop.whatsapp || shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.website
        if (!hasContact) {
          push('bot', `Contact info hasn't been set up yet. Order directly through me!`)
          return
        }
        push('bot', [
          `📞 *Contact ${shop.name || 'Us'}*`,
          ``,
          shop.phone ? `📱 Phone: ${shop.phone}` : '',
          shop.whatsapp ? `💬 WhatsApp: ${shop.whatsapp}` : '',
          shop.socialLinks?.facebook ? `👤 Facebook: ${shop.socialLinks.facebook}` : '',
          shop.socialLinks?.instagram ? `📸 Instagram: ${shop.socialLinks.instagram}` : '',
          shop.website ? `🌐 Website: ${shop.website}` : '',
          ``,
          shop.businessHours ? `🕐 Hours: ${shop.businessHours}` : '',
          shop.location ? `📍 Location: ${shop.location}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ── Shop info ────────────────────────────────────────────────────────────

      if (/\b(shop info|about shop|about us|store info|who are you|your shop)\b/.test(lower)) {
        push('bot', [
          `🏪 *${shop.name || 'Our Shop'}*`,
          shop.tagline ? `✨ "${shop.tagline}"` : '',
          shop.description ? `📄 ${shop.description}` : '',
          ``,
          shop.location ? `📍 ${shop.location}` : '',
          shop.phone ? `📞 ${shop.phone}` : '',
          shop.businessHours ? `🕐 ${shop.businessHours}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ── Business hours ───────────────────────────────────────────────────────

      if (/\b(hours?|open|close|timing|when are you|business hour|schedule)\b/.test(lower)) {
        push('bot', [
          `🕐 *Business Hours*`,
          shop.businessHours || '10 AM - 8 PM',
          shop.location ? `📍 ${shop.location}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ── Order intent ─────────────────────────────────────────────────────────

      if (/\b(order|buy|purchase|want|need|book|kinnu|din|get me)\b/.test(lower)) {
        const cleanQuery = lower.replace(/\b(order|buy|purchase|want|need|book|kinnu|din|get me|i want|i need|can i get)\b/g, '').trim()
        const directMatch = cleanQuery.length > 1 ? matchProduct(products, cleanQuery)[0] : null
        if (directMatch) {
          if (directMatch.stock <= 0) {
            push('bot', `Sorry, *${directMatch.name}* is out of stock. 😔`)
            return
          }
          setData({ product: directMatch.name, amount: directMatch.price, productImage: directMatch.image })
          setStep('name')
          push('bot', `Let's order *${directMatch.name}* for NPR ${fmt(directMatch.price)}! 🎉\n\nWhat's your full name?`)
        } else {
          setStep('product')
          lastList.current = products.slice(0, 8)
          push('bot', [
            `Let's place your order! 🛍️`,
            ``,
            `Which product would you like?`,
            ``,
            products.slice(0, 8).map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n'),
            ``,
            `Type a number or product name to select.`,
          ].join('\n'))
        }
        return
      }

      // ── Thank you ────────────────────────────────────────────────────────────

      if (/\b(thank|thanks|dhanyabad|shukriya|ok|okay|great|perfect|awesome|nice)\b/.test(lower)) {
        push('bot', `You're welcome! 😊 Is there anything else I can help with?\n\nType *help* to see all commands.`)
        return
      }

      // ── Fuzzy product match before fallback ──────────────────────────────────

      const fuzzy = matchProduct(products, lower)
      if (fuzzy.length > 0) {
        lastList.current = fuzzy
        push('bot', [
          `Here's what I found:`,
          ``,
          fuzzy.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n'),
          ``,
          `Type a number for details or *add [item]* to cart.`,
        ].join('\n'))
        return
      }

      // ── Fallback ─────────────────────────────────────────────────────────────

      push('bot', [
        `I'm not sure about that 😅`,
        ``,
        `Try:`,
        `• *products* — browse everything`,
        `• *contact* — reach the shop`,
        `• *help* — full command list`,
        ``,
        `Or just describe what you're looking for!`,
      ].join('\n'))

    }, 350)
  }, [step, data, cart, keywords, products, shop, onOrderComplete, push])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const quickReplies = step ? [] : ['products', 'categories', 'cart', 'delivery', 'contact', 'help']

  return { messages, send, quickReplies, cart, cartCount,
    // legacy compat
    init: () => {},
  }
}

// ── Chat drawer ───────────────────────────────────────────────────────────────
export function ChatDrawer({ colors, onClose, keywords, products, shop, onOrderComplete, initialCart = [] }) {
  const { messages, send, quickReplies, cartCount } = usePubBot(keywords, products, onOrderComplete, shop, initialCart)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const submit = () => { if (!input.trim()) return; send(input); setInput('') }

  // Bold *text* renderer
  const renderText = (text) =>
    text.split('\n').map((line, i, arr) => {
      const parts = line.split(/(\*[^*]+\*)/g)
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith('*') && part.endsWith('*')
              ? <strong key={j}>{part.slice(1, -1)}</strong>
              : part
          )}
          {i < arr.length - 1 && <br />}
        </span>
      )
    })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <style>{`
        @media (min-width: 700px) {
          .pub-chat-panel {
            position: absolute !important;
            right: 0 !important; bottom: 0 !important; top: 0 !important;
            width: 420px !important; max-width: 420px !important;
            height: 100% !important; max-height: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="pub-chat-panel" style={{
        width: '100%', maxWidth: 460, borderRadius: '32px 32px 0 0',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: '85vh', maxHeight: 700, background: colors.bg,
        boxShadow: '0 -20px 40px rgba(0,0,0,0.2)',
        border: `1px solid ${colors.accent}22`, position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.01em' }}>Shop Assistant</p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0, fontWeight: 600 }}>Usually replies instantly</p>
          </div>
          {cartCount > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 10, padding: '4px 10px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              onClick={() => send('cart')}>
              🛒 {cartCount}
            </div>
          )}
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, background: `linear-gradient(to bottom, ${colors.accent}05, transparent)` }}>
          {messages.map((m, i) => (
            <div key={m.id || i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%', borderRadius: m.from === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                padding: '12px 16px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                background: m.from === 'user' ? colors.accent : colors.card,
                color: m.from === 'user' ? '#fff' : colors.text,
                boxShadow: m.from === 'bot' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                border: m.from === 'bot' ? `1px solid ${colors.accent}11` : 'none',
              }}>
                {m.from === 'bot' ? renderText(m.text) : m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {quickReplies.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '0 24px 12px', flexWrap: 'wrap', flexShrink: 0 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => send(q)} style={{
                background: colors.card, border: `1px solid ${colors.accent}33`, color: colors.accent,
                borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700,
                fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s'
              }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 24px 32px', borderTop: `1px solid ${colors.accent}11`, display: 'flex', gap: 10, flexShrink: 0, background: colors.card }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ask anything or type 'help'…"
            style={{
              flex: 1, border: `1px solid ${colors.accent}22`, borderRadius: 16,
              padding: '14px 18px', fontSize: 14, background: colors.bg,
              color: colors.text, outline: 'none', fontFamily: 'var(--font-body)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }} />
          <button onClick={submit} style={{
            background: colors.accent, color: '#fff', border: 'none',
            borderRadius: 16, width: 48, height: 48, cursor: 'pointer',
            fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${colors.accent}44`
          }}>→</button>
        </div>
      </div>
    </div>
  )
}

export function CartDrawer({ colors, cart, onRemove, onClose, onCheckout }) {
  const totalItems = cart.reduce((s, p) => s + (p.qty || 1), 0)
  const total = cart.reduce((s, p) => s + p.price * (p.qty || 1), 0)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <style>{`
        .pub-cart-panel { width: 100%; max-width: 100%; }
        @media (min-width: 480px) { .pub-cart-panel { max-width: 420px; } }
        @media (min-width: 900px) { .pub-cart-panel { max-width: 480px; } }
      `}</style>

      <div className="pub-cart-panel" style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: colors.bg, boxShadow: '-20px 0 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px', background: colors.accent, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛒</div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, flex: 1, margin: 0, letterSpacing: '-0.01em' }}>Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
                <p style={{ fontSize: 64, margin: '0 0 16px' }}>🛒</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>Your cart is empty</p>
              </div>
            )
            : cart.map((p) => (
              <div key={p._id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
                borderBottom: `1px solid ${colors.accent}11`
              }}>
                <ProductImg product={p} size={56} borderRadius={12} bg={colors.card} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 2px', lineHeight: 1.2 }}>{p.name}</p>
                  <p style={{ fontWeight: 800, color: colors.accent, fontSize: 14, margin: '0 0 4px' }}>NPR {p.price.toLocaleString()} × {p.qty || 1}</p>
                  <p style={{ fontWeight: 600, color: colors.text, fontSize: 13, margin: 0, opacity: 0.5 }}>= NPR {(p.price * (p.qty || 1)).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: `${colors.accent}18`, color: colors.accent, borderRadius: 8, padding: '2px 8px' }}>×{p.qty || 1}</span>
                  <button onClick={() => onRemove(p._id)} style={{
                    background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer',
                    width: 30, height: 30, borderRadius: 8, color: '#ef4444', fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>✕</button>
                </div>
              </div>
            ))
          }
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '24px 24px 40px', background: colors.card, borderTop: `1px solid ${colors.accent}11`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.6, color: colors.text }}>Total Amount</span>
              <span style={{ fontWeight: 900, fontSize: 24, color: colors.accent }}>NPR {total.toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} style={{
              width: '100%', background: colors.accent, color: '#fff',
              border: 'none', borderRadius: 18, padding: '16px', fontSize: 16,
              fontWeight: 800, fontFamily: 'var(--font-body)', cursor: 'pointer',
              boxShadow: `0 8px 20px ${colors.accent}44`, transition: 'all 0.2s'
            }}>
              Place Order via Chat 🚀
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, marginTop: 16, opacity: 0.5, fontWeight: 600 }}>Cash on Delivery available</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Product Detail Drawer ────────────────────────────────────────────────────
// A beautiful slide-up panel showing full product info + add-to-cart.
// Usage: <ProductDetailDrawer product={p} colors={colors} onClose={...} onAddToCart={...} />
export function ProductDetailDrawer({ product, colors, onClose, onAddToCart }) {
  const [added, setAdded] = useState(false)
  const panelRef = useRef(null)

  // Trap focus & close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleAddToCart = () => {
    onAddToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // Format description: turn newlines into paragraphs / bullets
  const descLines = product.description
    ? product.description.split('\n').filter(l => l.trim())
    : []

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes pdSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .pd-panel {
          animation: pdSlideUp 0.35s cubic-bezier(0.16,1,0.3,1);
          width: 100%; max-width: 560px;
          max-height: 92dvh; overflow-y: auto;
          border-radius: 32px 32px 0 0;
          scrollbar-width: none;
        }
        .pd-panel::-webkit-scrollbar { display: none; }
        @media (min-width: 640px) {
          .pd-panel {
            max-height: 88dvh;
            border-radius: 32px;
            margin-bottom: 32px;
          }
        }
        .pd-add-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .pd-add-btn:hover { transform: translateY(-2px); }
        .pd-add-btn:active { transform: scale(0.97); }
      `}</style>

      <div ref={panelRef} className="pd-panel" style={{ background: colors.bg, boxShadow: '0 -24px 60px rgba(0,0,0,0.25)', position: 'relative' }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: `${colors.text}25` }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 20,
            background: `${colors.text}12`, border: 'none',
            width: 36, height: 36, borderRadius: 18,
            cursor: 'pointer', fontSize: 16, color: colors.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}
        >✕</button>

        {/* Product image */}
        <div style={{ margin: "12px 16px 0", borderRadius: 20, overflow: "hidden", background: `${colors.accent}08`, minHeight: 240 }}>
          <ProductImgFull product={product} height={320} bg={`${colors.accent}08`} fontSize={96} borderRadius={20} />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 24px 40px' }}>

          {/* Category badge */}
          {product.category && product.category !== 'General' && (
            <span style={{
              display: 'inline-block', background: `${colors.accent}18`,
              color: colors.accent, borderRadius: 20, padding: '4px 12px',
              fontSize: 12, fontWeight: 700, marginBottom: 12, letterSpacing: '0.02em',
            }}>
              {product.category}
            </span>
          )}

          {/* Name + price */}
          <h2 style={{ fontSize: 'clamp(20px,5vw,26px)', fontWeight: 900, margin: '0 0 8px', color: colors.text, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {product.name}
          </h2>
          <p style={{ fontSize: 26, fontWeight: 900, color: colors.accent, margin: '0 0 4px' }}>
            NPR {product.price.toLocaleString()}
          </p>

          {/* Stock indicator */}
          <p style={{ fontSize: 13, margin: '0 0 20px', fontWeight: 600, color: product.stock > 0 ? '#22c55e' : '#ef4444' }}>
            {product.stock > 5 ? '● In stock' : product.stock > 0 ? `● Only ${product.stock} left` : '○ Out of stock'}
          </p>

          {/* Divider */}
          <div style={{ height: 1, background: `${colors.accent}15`, margin: '0 0 20px' }} />

          {/* Description */}
          {descLines.length > 0 ? (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.accent, margin: '0 0 12px', opacity: 0.8 }}>
                About this product
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {descLines.map((line, i) => {
                  // Section headers (lines like "✦ Key Features" or "📐 Dimensions")
                  const isHeader = /^[✦📐🎁🧵🚚📦🌿🍵🎨🧴💄🪔👒🧣🍯👜]/.test(line) && !line.startsWith('•')
                  const isBullet = line.startsWith('•') || line.startsWith('-')
                  return (
                    <p key={i} style={{
                      margin: 0,
                      fontSize: isHeader ? 13 : 14,
                      fontWeight: isHeader ? 800 : isBullet ? 500 : 400,
                      color: isHeader ? colors.accent : colors.text,
                      opacity: isHeader ? 1 : isBullet ? 0.85 : 0.8,
                      lineHeight: 1.65,
                      paddingLeft: isBullet ? 8 : 0,
                      marginTop: isHeader ? 10 : 0,
                    }}>
                      {line}
                    </p>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28, padding: '16px', background: `${colors.accent}08`, borderRadius: 14, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, color: colors.text, opacity: 0.45, fontStyle: 'italic' }}>No description added yet.</p>
            </div>
          )}

          {/* Delivery info strip */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              ['🚚', product.stock > 0 ? 'Fast delivery' : 'Pre-order available'],
              ['💳', 'Cash on Delivery'],
              ['🔄', 'Easy returns'],
            ].map(([icon, label]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: `${colors.accent}0d`, borderRadius: 20,
                padding: '6px 14px', fontSize: 12, fontWeight: 600, color: colors.text,
              }}>
                <span>{icon}</span><span style={{ opacity: 0.75 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="pd-add-btn"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            style={{
              width: '100%',
              background: product.stock <= 0 ? '#9ca3af' : added ? '#22c55e' : colors.accent,
              color: '#fff', border: 'none', borderRadius: 18,
              padding: '18px', fontSize: 17, fontWeight: 900,
              fontFamily: 'var(--font-body)', cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: product.stock > 0 ? `0 8px 24px ${colors.accent}44` : 'none',
              transition: 'background 0.25s',
              letterSpacing: '-0.01em',
            }}
          >
            {product.stock <= 0 ? 'Out of Stock' : added ? '✓ Added to Bag!' : '🛍️ Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  )
}
