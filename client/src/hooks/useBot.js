import { useState, useCallback, useRef, useEffect } from 'react'
import { useShop } from '@/context/ShopContext'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) { return Number(n).toLocaleString() }

function matchProduct(visibleProducts, lower) {
  return visibleProducts.filter(p => {
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

function productCard(p, { showCategory = true, showDescription = true } = {}) {
  const stockLine = p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Out of stock'
  const cat = showCategory && p.category && p.category !== 'General' ? `🏷️ ${p.category}` : ''
  const desc = showDescription && p.description ? `📝 ${p.description}` : ''
  return [
    `${p.image || '📦'} *${p.name}*`,
    `💰 NPR ${fmt(p.price)} · ${stockLine}`,
    cat, desc
  ].filter(Boolean).join('\n')
}

function categorySummary(categories, products) {
  // categories[0] is the virtual "All" — skip it
  const real = categories.slice(1)
  if (real.length === 0) return null
  return real.map(c => {
    const count = products.filter(p => p.visible && p.category === c.label).length
    return `${c.emoji || '🏷️'} *${c.label}* — ${count} item${count !== 1 ? 's' : ''}`
  }).join('\n')
}

function shopInfoBlock(shop) {
  const lines = [
    `🏪 *${shop.name}*`,
    shop.tagline ? `✨ "${shop.tagline}"` : '',
    shop.description ? `📄 ${shop.description}` : '',
    '',
    shop.location ? `📍 Location: ${shop.location}` : '',
    shop.phone ? `📞 Phone: ${shop.phone}` : '',
    shop.whatsapp ? `💬 WhatsApp: ${shop.whatsapp}` : '',
    shop.businessHours ? `🕐 Hours: ${shop.businessHours}` : '',
    shop.socialLinks?.facebook ? `👤 Facebook: ${shop.socialLinks.facebook}` : '',
    shop.socialLinks?.instagram ? `📸 Instagram: ${shop.socialLinks.instagram}` : '',
    shop.website ? `🌐 Website: ${shop.website}` : '',
  ]
  return lines.filter(Boolean).join('\n')
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

// ─── Cart helpers ─────────────────────────────────────────────────────────────

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

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useBot({ productName, productPrice } = {}, overrideKeywords = null) {
  const { keywords: ctxKeywords, shop, addOrder, visibleProducts, categories } = useShop()
  const keywords = overrideKeywords ?? ctxKeywords

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 Welcome to *${shop.name}*!\n\nI can help you with:\n🛍️ Browse products & categories\n💰 Prices & stock\n🛒 Add to cart & checkout\n🚚 Delivery & returns\n📞 Contact & shop info\n\nType *help* anytime or tap a quick reply below!`,
    },
  ])

  // Multi-step order flow state
  const [orderStep, setOrderStep] = useState(null)
  const [orderData, setOrderData] = useState({})

  // Shopping cart
  const [cart, setCart] = useState([])

  // cartRef keeps sendMessage's setTimeout closures in sync with current cart
  // without needing cart in the sendMessage dependency array (which would cause
  // the callback to be recreated on every cart change).
  const cartRef = useRef([])
  useEffect(() => { cartRef.current = cart }, [cart])

  // Last shown products (for "tell me more about #2" style references)
  const lastListRef = useRef([])

  const push = useCallback((from, text) => {
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }])
  }, [])

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase().trim()

    setTimeout(async () => {

      // ══════════════════════════════════════════════════════════════════════
      // ORDER FLOW — multi-step checkout
      // ══════════════════════════════════════════════════════════════════════

      if (orderStep === 'product') {
        // Allow numeric selection from last list
        const numMatch = lower.match(/^(\d+)$/)
        let found = null
        if (numMatch) {
          const idx = parseInt(numMatch[1], 10) - 1
          found = lastListRef.current[idx] || null
        }
        if (!found) {
          const matches = matchProduct(visibleProducts, lower)
          found = matches[0] || null
        }
        if (!found) {
          push('bot', `I couldn't find that product. Here's what we have:\n\n${visibleProducts.slice(0, 8).map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}\n\nType a name or number to select.`)
          lastListRef.current = visibleProducts.slice(0, 8)
          return
        }
        setOrderData(d => ({ ...d, product: found.name, amount: found.price, productImage: found.image }))
        setOrderStep('name')
        push('bot', `Great choice! ${found.image} *${found.name}* — NPR ${fmt(found.price)}\n\nWhat's your full name?`)
        return
      }

      if (orderStep === 'qty') {
        const qty = parseInt(lower, 10)
        if (isNaN(qty) || qty < 1) {
          push('bot', `Please enter a valid quantity (e.g. 1, 2, 3).`)
          return
        }
        const p = orderData.cartProduct
        addToCart(p, qty)
        setOrderStep(null)
        setOrderData({})
        push('bot', `✅ Added ${qty} × ${p.image} *${p.name}* to your cart!\n\nCart total: NPR ${fmt(cartRef.current.reduce((s,i)=>s+i.price*i.qty,0) + p.price * qty)}\n\nContinue shopping or type *cart* to review.`)
        return
      }

      if (orderStep === 'name') {
        setOrderData(d => ({ ...d, name: text.trim() }))
        setOrderStep('address')
        push('bot', `Thank you, ${text.trim()}! 🙏\n\nWhat's your delivery address? (Include district/city)`)
        return
      }

      if (orderStep === 'address') {
        setOrderData(d => ({ ...d, address: text.trim() }))
        setOrderStep('phone')
        push('bot', `Got it! 📍 Last step — what's your phone number?\n(We'll call before delivery)`)
        return
      }

      if (orderStep === 'phone') {
        const phone = text.trim()
        const finalData = { ...orderData, phone }

        // Determine what's being ordered — cart or single product
        const isCartCheckout = finalData.cartCheckout && cart.length > 0
        const productLine = isCartCheckout
          ? cart.map(i => `${i.name} ×${i.qty}`).join(', ')
          : (finalData.product || productName || 'General Order')
        const totalAmount = isCartCheckout
          ? cart.reduce((s, i) => s + i.price * i.qty, 0)
          : (finalData.amount || productPrice || 0)

        setOrderStep(null)
        setOrderData({})

        try {
          await addOrder({
            customer: finalData.name,
            phone,
            address:  finalData.address,
            product:  productLine,
            amount:   totalAmount,
            source:   'bot',
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
            `${deliveryBlock(shop)}`,
            ``,
            `Thank you for shopping at *${shop.name}*! 🙏`,
          ].join('\n'))
        } catch {
          push('bot', `Sorry, something went wrong saving your order. Please contact us directly.\n\n${shop.phone ? `📞 ${shop.phone}` : ''}`)
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // KEYWORD triggers (seller-defined, comma-separated)
      // ══════════════════════════════════════════════════════════════════════

      const kwMatch = keywords.find(k => {
        const triggers = k.trigger.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        return triggers.some(t => lower.includes(t))
      })
      if (kwMatch) { push('bot', kwMatch.reply); return }

      // ══════════════════════════════════════════════════════════════════════
      // CART commands
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(cart|basket|bag|my items|my cart)\b/.test(lower)) {
        push('bot', renderCart(cart, shop))
        return
      }

      if (/\b(checkout|check out|place order|confirm order|buy now|pay)\b/.test(lower)) {
        if (cart.length === 0) {
          push('bot', `Your cart is empty! 🛒\n\nBrowse our products first — type *products* or ask for a category.`)
          return
        }
        const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
        setOrderData({ cartCheckout: true })
        setOrderStep('name')
        push('bot', `Let's complete your order! 🛍️\n\n${renderCart(cart, shop)}\n\n---\nWhat's your full name?`)
        return
      }

      if (/\b(clear cart|empty cart|reset cart|remove all)\b/.test(lower)) {
        setCart([])
        push('bot', `🗑️ Cart cleared! Start fresh — type *products* to browse.`)
        return
      }

      // Remove specific item from cart
      if (/\b(remove|delete|take out)\b/.test(lower)) {
        const toRemove = cart.find(i => lower.includes(i.name.toLowerCase().split(' ')[0].toLowerCase()))
        if (toRemove) {
          setCart(prev => prev.filter(i => i.name !== toRemove.name))
          push('bot', `✅ Removed *${toRemove.name}* from your cart.\n\n${renderCart(cart.filter(i => i.name !== toRemove.name), shop)}`)
        } else {
          push('bot', `I couldn't find that item in your cart.\n\n${renderCart(cart, shop)}`)
        }
        return
      }

      // Add to cart: "add [product] to cart" or "add 2 [product]"
      const addCartMatch = lower.match(/\badd(?:\s+(\d+))?\s+(.+?)(?:\s+to\s+(?:cart|bag|basket))?$/)
      if (addCartMatch || /\badd to cart\b/.test(lower)) {
        const qty = parseInt(addCartMatch?.[1] || '1', 10)
        const namePart = addCartMatch?.[2] || lower.replace(/\badd\b|\bto cart\b/g, '').trim()
        // Check if it's a numeric reference
        const numRef = namePart.match(/^(\d+)$/)
        let product = null
        if (numRef) {
          product = lastListRef.current[parseInt(numRef[1], 10) - 1] || null
        } else {
          product = matchProduct(visibleProducts, namePart)[0] || null
        }
        if (product) {
          if (product.stock <= 0) {
            push('bot', `Sorry, *${product.name}* is currently out of stock. 😔\n\nHere's what's available:\n\n${visibleProducts.filter(p => p.stock > 0).map(p => `• ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}`)
            return
          }
          addToCart(product, qty)
          const newTotal = cartRef.current.reduce((s,i)=>s+i.price*i.qty,0) + product.price * qty
          push('bot', `✅ *${qty} × ${product.name}* added to cart!\n\n💰 Cart total: NPR ${fmt(newTotal)}\n\nType *cart* to review or continue shopping.`)
        } else if (namePart.length > 1) {
          const suggestions = matchProduct(visibleProducts, namePart.split(' ')[0])
          push('bot', suggestions.length > 0
            ? `Did you mean one of these?\n\n${suggestions.map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}\n\nType *add [number]* to add.`
            : `I couldn't find that product. Type *products* to see everything we carry.`)
          if (suggestions.length > 0) lastListRef.current = suggestions
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // PRODUCT DETAIL — "tell me about [product]", "info on [product]", "#2"
      // ══════════════════════════════════════════════════════════════════════

      const detailTrigger = /\b(about|details?|info|more|describe|what is|tell me)\b/.test(lower) ||
        lower.match(/^#?(\d+)$/)
      if (detailTrigger) {
        const numRef = lower.match(/^#?(\d+)$/)
        let target = null
        if (numRef) {
          target = lastListRef.current[parseInt(numRef[1], 10) - 1] || null
        } else {
          target = matchProduct(visibleProducts, lower)[0] || null
        }
        if (target) {
          const inCart = cart.find(i => i.name === target.name)
          push('bot', [
            productCard(target, { showCategory: true, showDescription: true }),
            ``,
            inCart ? `🛒 You have ${inCart.qty} in your cart.` : '',
            `Type *add ${target.name}* to cart, or *order* to buy directly.`,
          ].filter(Boolean).join('\n'))
          return
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // GREETING
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(hello|hi|hey|namaste|namaskar|sup|good morning|good evening|greetings|yo)\b/.test(lower)) {
        push('bot', [
          `Namaste! 🙏 Great to see you!`,
          ``,
          `Here's what I can help with:`,
          `• 🛍️ *products* — see all items`,
          `• 🏷️ *categories* — browse by type`,
          `• 💰 *price [item]* — check a price`,
          `• 🛒 *cart* — your shopping cart`,
          `• 📞 *contact* — reach the shop`,
          `• ℹ️ *shop info* — hours, location, etc.`,
          `• 🚚 *delivery* — shipping info`,
          `• 📦 *order* — place an order`,
          ``,
          `What would you like to do?`,
        ].join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // HELP
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(help|commands|what can you do|options|menu|guide)\b/.test(lower)) {
        push('bot', [
          `🤖 *PasalBot Help Guide*`,
          ``,
          `*Shopping*`,
          `• products / show all — see everything`,
          `• [category name] — filter by category`,
          `• price [item] — check price`,
          `• stock [item] — check availability`,
          `• add [item] to cart — add to cart`,
          `• cart — view your cart`,
          `• checkout — place your order`,
          `• remove [item] — remove from cart`,
          `• clear cart — start over`,
          ``,
          `*Product Info*`,
          `• about [item] / #[number] — item details`,
          `• compare [item1] vs [item2] — compare`,
          `• new / latest — newest arrivals`,
          `• cheap / budget — most affordable`,
          `• best sellers / popular — top picks`,
          ``,
          `*Shop Info*`,
          `• shop info — name, hours, location`,
          `• contact — phone, social, WhatsApp`,
          `• delivery — shipping details`,
          `• payment — payment options`,
          `• return policy — returns & refunds`,
          `• categories — browse categories`,
          ``,
          `*Order*`,
          `• order — start ordering`,
          `• order [item] — order specific item`,
        ].join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // CATEGORIES
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(categor|section|type|department|kind of)\b/.test(lower)) {
        const summary = categorySummary(categories, visibleProducts)
        if (!summary) {
          push('bot', `No categories set up yet. Type *products* to see everything.`)
        } else {
          push('bot', `🏷️ *Browse by Category*\n\n${summary}\n\nType any category name to filter products!`)
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // CATEGORY FILTER — match category name
      // ══════════════════════════════════════════════════════════════════════

      const matchedCat = categories.slice(1).find(c =>
        lower.includes(c.label.toLowerCase()) || c.label.toLowerCase().includes(lower)
      )
      if (matchedCat && visibleProducts.some(p => p.category === matchedCat.label)) {
        const catProds = visibleProducts.filter(p => p.category === matchedCat.label)
        lastListRef.current = catProds
        push('bot', [
          `${matchedCat.emoji || '🏷️'} *${matchedCat.label}* (${catProds.length} item${catProds.length !== 1 ? 's' : ''})`,
          ``,
          catProds.map((p, i) => `${i + 1}. ${productCard(p, { showCategory: false, showDescription: true })}`).join('\n\n'),
          ``,
          `Type a number or product name for more details, or *add [item]* to cart.`,
        ].filter(Boolean).join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // PRICE CHECK
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(price|rate|cost|kati|paisa|kitna|how much|rates|worth)\b/.test(lower)) {
        const matched = matchProduct(visibleProducts, lower.replace(/\b(price|rate|cost|kati|paisa|kitna|how much|rates|worth|of|the|for)\b/g, '').trim())
        if (matched.length > 0) {
          lastListRef.current = matched
          push('bot', matched.map(p => productCard(p)).join('\n\n'))
        } else if (visibleProducts.length > 0) {
          lastListRef.current = visibleProducts
          push('bot', `💰 *Price List*\n\n${visibleProducts.map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n')}`)
        } else {
          push('bot', `No products listed yet. Check back soon!`)
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // STOCK / AVAILABILITY
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(stock|available|left|baki|cha|availability|in stock|out of stock)\b/.test(lower)) {
        const matched = matchProduct(visibleProducts, lower.replace(/\b(stock|available|left|baki|cha|availability|in stock|out of stock|is|any|the)\b/g, '').trim())
        const list = matched.length > 0 ? matched : visibleProducts
        if (list.length === 0) {
          push('bot', `No products listed yet.`)
        } else {
          push('bot', `📦 *Stock Availability*\n\n${list.map(p =>
            `${p.image} *${p.name}*: ${p.stock > 0 ? `✅ ${p.stock} available` : '❌ Out of stock'}`
          ).join('\n')}`)
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // PRODUCT LIST — all products
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(products?|items?|list|show|all|what do you sell|catalog|menu|everything|what.+have)\b/.test(lower)) {
        if (visibleProducts.length === 0) {
          push('bot', `No products are live yet. Check back soon!`)
        } else {
          lastListRef.current = visibleProducts
          const catSummary = categorySummary(categories, visibleProducts)
          push('bot', [
            `🛍️ *${shop.name} — Full Catalog* (${visibleProducts.length} items)`,
            ``,
            catSummary ? `*Categories:* ${categories.slice(1).map(c => `${c.emoji} ${c.label}`).join(' · ')}` : '',
            ``,
            visibleProducts.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n'),
            ``,
            `Type a number or name for details · Type *add [item]* to cart · Type *checkout* when ready`,
          ].filter(Boolean).join('\n'))
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // NEW / LATEST ARRIVALS
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(new|latest|recent|just added|arrived|fresh)\b/.test(lower)) {
        const newest = [...visibleProducts]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5)
        lastListRef.current = newest
        push('bot', `🆕 *Latest Arrivals*\n\n${newest.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}\n\nType a number or name for details.`)
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // BUDGET / CHEAPEST
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(cheap|budget|affordable|lowest price|cheapest|under|less than)\b/.test(lower)) {
        const priceLimit = lower.match(/(?:under|less than|below)\s*(?:npr\s*)?([\d,]+)/)
        let budget = priceLimit ? parseInt(priceLimit[1].replace(/,/g, ''), 10) : Infinity
        const sorted = [...visibleProducts]
          .filter(p => p.price <= budget)
          .sort((a, b) => a.price - b.price)
          .slice(0, 6)
        lastListRef.current = sorted
        push('bot', sorted.length > 0
          ? `💸 *Budget-Friendly Picks*\n\n${sorted.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}`
          : `No products found under that price. Our lowest priced item is *${[...visibleProducts].sort((a,b)=>a.price-b.price)[0]?.name}* at NPR ${fmt([...visibleProducts].sort((a,b)=>a.price-b.price)[0]?.price)}.`)
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // COMPARE products
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(compare|vs|versus|difference|which is better|which one)\b/.test(lower)) {
        const vsMatch = lower.match(/(.+?)\s+(?:vs\.?|versus|or|compare|and)\s+(.+)/)
        if (vsMatch) {
          const a = matchProduct(visibleProducts, vsMatch[1].trim())[0]
          const b = matchProduct(visibleProducts, vsMatch[2].trim())[0]
          if (a && b) {
            push('bot', [
              `⚖️ *Comparison*`,
              ``,
              `${a.image} *${a.name}*`,
              `💰 Price: NPR ${fmt(a.price)}`,
              `📦 Stock: ${a.stock > 0 ? `${a.stock} available` : 'Out of stock'}`,
              a.category ? `🏷️ Category: ${a.category}` : '',
              a.description ? `📝 ${a.description}` : '',
              ``,
              `${b.image} *${b.name}*`,
              `💰 Price: NPR ${fmt(b.price)}`,
              `📦 Stock: ${b.stock > 0 ? `${b.stock} available` : 'Out of stock'}`,
              b.category ? `🏷️ Category: ${b.category}` : '',
              b.description ? `📝 ${b.description}` : '',
              ``,
              a.price < b.price ? `💡 *${a.name}* is NPR ${fmt(b.price - a.price)} cheaper.` : a.price > b.price ? `💡 *${b.name}* is NPR ${fmt(a.price - b.price)} cheaper.` : `💡 Both are the same price!`,
            ].filter(Boolean).join('\n'))
            return
          }
        }
        push('bot', `Try: *compare [product A] vs [product B]*\n\nFor example: "compare shirt vs jacket"`)
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // SEARCH / FIND a product
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(search|find|looking for|do you have|got any|have you)\b/.test(lower)) {
        const query = lower.replace(/\b(search|find|looking for|do you have|got any|have you|any|for)\b/g, '').trim()
        const results = matchProduct(visibleProducts, query)
        if (results.length > 0) {
          lastListRef.current = results
          push('bot', `🔍 *Search Results for "${query}"*\n\n${results.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n')}\n\nType a number or *add [item]* to cart.`)
        } else {
          push('bot', `😔 No results for "${query}".\n\nTry browsing by category:\n${categorySummary(categories, visibleProducts) || 'Type *products* to see everything.'}`)
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // DELIVERY / SHIPPING
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(delivery|deliver|shipping|ship|dispatch|arrive|when|kati din|days|how long)\b/.test(lower)) {
        push('bot', deliveryBlock(shop))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // PAYMENT
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(payment|pay|cash|cod|online|esewa|khalti|card|bank)\b/.test(lower)) {
        const methods = Array.isArray(shop.paymentMethods) ? shop.paymentMethods : ['COD']
        push('bot', [
          `💳 *Payment Options*`,
          ``,
          methods.map(m => `✅ ${m}`).join('\n'),
          ``,
          shop.freeDeliveryThreshold > 0 ? `🎁 Free delivery on orders over NPR ${fmt(shop.freeDeliveryThreshold)}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // RETURN POLICY
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(return|refund|exchange|policy|replace|broken|damaged|wrong)\b/.test(lower)) {
        push('bot', [
          `🔄 *Return & Exchange Policy*`,
          ``,
          shop.returnPolicy || 'Return/exchange within 3 days of delivery.',
          ``,
          `📞 To initiate a return, contact us:`,
          shop.phone ? `Phone: ${shop.phone}` : '',
          shop.whatsapp ? `WhatsApp: ${shop.whatsapp}` : '',
          shop.socialLinks?.facebook ? `Facebook: ${shop.socialLinks.facebook}` : '',
        ].filter(Boolean).join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // HOW TO ORDER
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(how to order|how do i order|ordering|process|steps)\b/.test(lower)) {
        push('bot', [
          `📋 *How to Order*`,
          ``,
          shop.howToOrder || 'Order via the shop bot or DM us.',
          ``,
          `🤖 *Order via Bot* (right here!):`,
          `1. Browse products — type *products*`,
          `2. Add to cart — type *add [item]*`,
          `3. Review cart — type *cart*`,
          `4. Checkout — type *checkout*`,
          `5. Provide name, address & phone`,
          `6. Done! We'll call before delivery ✅`,
        ].filter(Boolean).join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // CONTACT INFO
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(contact|reach|call|phone|number|whatsapp|social|facebook|instagram|email|dm|message us)\b/.test(lower)) {
        const hasContact = shop.phone || shop.whatsapp || shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.website
        if (!hasContact) {
          push('bot', `Contact information hasn't been set up yet. Please try ordering directly through the bot!`)
          return
        }
        push('bot', [
          `📞 *Contact ${shop.name}*`,
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

      // ══════════════════════════════════════════════════════════════════════
      // SHOP INFO
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(shop info|about shop|about us|store info|who are you|your shop|shop detail)\b/.test(lower)) {
        push('bot', shopInfoBlock(shop))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // BUSINESS HOURS
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(hours?|open|close|timing|when are you|business hour|schedule)\b/.test(lower)) {
        push('bot', [
          `🕐 *Business Hours*`,
          shop.businessHours || '10 AM - 8 PM',
          ``,
          shop.location ? `📍 ${shop.location}` : '',
          ``,
          `Have a question outside hours? Drop us a message and we'll reply asap! 📩`,
        ].filter(Boolean).join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // ORDER INTENT — place an order directly
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(order|buy|purchase|want|need|book|kinnu|din|get me)\b/.test(lower)) {
        // Try to match a specific product in the same message
        const cleanQuery = lower.replace(/\b(order|buy|purchase|want|need|book|kinnu|din|get me|i want|i need|can i get|can i order)\b/g, '').trim()
        const directMatch = cleanQuery.length > 1 ? matchProduct(visibleProducts, cleanQuery)[0] : null

        if (directMatch) {
          if (directMatch.stock <= 0) {
            push('bot', `Sorry, *${directMatch.name}* is currently out of stock. 😔\n\nWould you like to see similar items or be notified when it's back? Just ask!`)
            return
          }
          setOrderData({ product: directMatch.name, amount: directMatch.price, productImage: directMatch.image })
          setOrderStep('name')
          push('bot', `Let's order *${directMatch.name}* for NPR ${fmt(directMatch.price)}! 🎉\n\nWhat's your full name?`)
        } else if (productName) {
          setOrderData({ product: productName, amount: productPrice })
          setOrderStep('name')
          push('bot', `Let's order *${productName}* for NPR ${fmt(productPrice)}! 🎉\n\nWhat's your full name?`)
        } else {
          setOrderStep('product')
          lastListRef.current = visibleProducts.slice(0, 8)
          push('bot', [
            `Let's place your order! 🛍️`,
            ``,
            `Which product would you like?`,
            ``,
            visibleProducts.slice(0, 8).map((p, i) => `${i + 1}. ${p.image} ${p.name} — NPR ${fmt(p.price)}`).join('\n'),
            ``,
            `Type a number or product name to select.`,
          ].join('\n'))
        }
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // THANK YOU
      // ══════════════════════════════════════════════════════════════════════

      if (/\b(thank|thanks|dhanyabad|shukriya|ok|okay|great|perfect|awesome|nice|good|cool)\b/.test(lower)) {
        push('bot', `You're welcome! 😊 Is there anything else I can help you with?\n\nType *help* to see all commands, or *products* to keep shopping!`)
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // SMART FUZZY MATCH — try to find a product anyway before fallback
      // ══════════════════════════════════════════════════════════════════════

      const fuzzyMatches = matchProduct(visibleProducts, lower)
      if (fuzzyMatches.length > 0) {
        lastListRef.current = fuzzyMatches
        push('bot', [
          `Here's what I found for you:`,
          ``,
          fuzzyMatches.map((p, i) => `${i + 1}. ${productCard(p)}`).join('\n\n'),
          ``,
          `Type a number for details, *add [item]* to add to cart, or *order [item]* to buy.`,
        ].join('\n'))
        return
      }

      // ══════════════════════════════════════════════════════════════════════
      // FALLBACK
      // ══════════════════════════════════════════════════════════════════════

      push('bot', [
        `I'm not sure about that 😅`,
        ``,
        `Here are some things I can help with:`,
        `• Type *products* — see everything`,
        `• Type *categories* — browse by type`,
        `• Type *cart* — view your cart`,
        `• Type *contact* — reach us`,
        `• Type *help* — full command list`,
        ``,
        `Or just describe what you're looking for and I'll try to find it! 🔍`,
      ].join('\n'))

    }, 350)
  }, [orderStep, orderData, cart, keywords, push, shop, visibleProducts, categories, addOrder, productName, productPrice])

  // ── Cart helpers (closure-safe) ───────────────────────────────────────────

  function addToCart(product, qty = 1) {
    setCart(prev => {
      const existing = prev.find(i => i.name === product.name)
      if (existing) {
        return prev.map(i => i.name === product.name ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { name: product.name, price: product.price, image: product.image || '📦', qty }]
    })
  }

  // ── Quick replies ─────────────────────────────────────────────────────────

  const quickReplies = orderStep
    ? (orderStep === 'product' ? [] : [])
    : [
        'products',
        'categories',
        'cart',
        'delivery',
        'contact',
        'help',
      ]

  return { messages, sendMessage, quickReplies, cart }
}
