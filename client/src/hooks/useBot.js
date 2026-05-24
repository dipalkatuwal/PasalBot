import { useState, useCallback } from 'react'
import { useShop } from '@/context/ShopContext'

export function useBot({ productName, productPrice } = {}, overrideKeywords = null) {
  const { keywords: ctxKeywords, shop, addOrder, visibleProducts } = useShop()
  const keywords = overrideKeywords ?? ctxKeywords

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 Welcome to ${shop.name}.\nAsk me anything — price, delivery, returns — or type "order" to buy!`,
    },
  ])
  const [orderStep, setOrderStep] = useState(null)
  const [orderData, setOrderData] = useState({})

  const push = useCallback((from, text) => {
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }])
  }, [])

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase()

    setTimeout(async () => {

      // ── Order flow ────────────────────────────────────────────────────────
      if (orderStep === 'product') {
        const found = visibleProducts.find(p =>
          p.name.toLowerCase().includes(lower) ||
          lower.includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
        )
        if (!found) {
          push('bot', `I couldn't find that. Here's what we have:\n${visibleProducts.slice(0, 6).map(p => `• ${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
          return
        }
        setOrderData(d => ({ ...d, product: found.name, amount: found.price }))
        setOrderStep('name')
        push('bot', `Great choice! ${found.image} *${found.name}* — NPR ${found.price.toLocaleString()}\n\nWhat's your full name?`)
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
        setOrderStep(null)
        setOrderData({})
        try {
          await addOrder({
            customer: finalData.name,
            phone,
            product:  finalData.product || productName || 'General Order',
            amount:   finalData.amount  || productPrice || 0,
            source:   'bot',
          })
          push('bot', `✅ Order confirmed!\n\n📦 Product: ${finalData.product}\n👤 Name: ${finalData.name}\n📞 Phone: ${phone}\n💵 Payment: Cash on Delivery\n\nWe'll deliver in 1–3 days and call you before arrival. Thank you for shopping at ${shop.name}! 🙏`)
        } catch {
          push('bot', `Sorry, something went wrong saving your order. Please contact us directly.`)
        }
        return
      }

      // ── Keyword triggers (seller-defined) ─────────────────────────────────
      // Support comma-separated multi-trigger: "return, refund, exchange"
      const kwMatch = keywords.find(k => {
        const triggers = k.trigger.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        return triggers.some(t => lower.includes(t))
      })
      if (kwMatch) {
        push('bot', kwMatch.reply)
        return
      }

      // ── Built-in smart replies ─────────────────────────────────────────────

      // Greeting
      if (/\b(hello|hi|hey|namaste|namaskar|sup|good morning|good evening)\b/.test(lower)) {
        push('bot', `Namaste! 🙏 How can I help you today?\n\nYou can ask me about:\n• Prices & stock\n• Delivery & shipping\n• How to order\n• Or just type "products" to see everything`)
        return
      }

      // Price — try to match a specific product first
      if (/\b(price|rate|cost|kati|paisa|kitna|how much|rates)\b/.test(lower)) {
        const matched = visibleProducts.filter(p =>
          lower.includes(p.name.toLowerCase().split(' ')[0].toLowerCase()) ||
          p.name.toLowerCase().split(' ').some(w => w.length > 3 && lower.includes(w.toLowerCase()))
        )
        if (matched.length > 0) {
          push('bot', matched.map(p => `${p.image} *${p.name}*\nNPR ${p.price.toLocaleString()} · ${p.stock > 0 ? `${p.stock} in stock` : '⚠️ Out of stock'}`).join('\n\n'))
        } else if (visibleProducts.length > 0) {
          push('bot', `Here are our prices:\n\n${visibleProducts.map(p => `${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
        } else {
          push('bot', `No products are listed yet. Please check back soon!`)
        }
        return
      }

      // Stock / availability
      if (/\b(stock|available|left|baki|cha|availability|in stock|out of stock)\b/.test(lower)) {
        const matched = visibleProducts.filter(p =>
          lower.includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
        )
        const list = matched.length > 0 ? matched : visibleProducts
        if (list.length === 0) {
          push('bot', `No products listed yet.`)
        } else {
          push('bot', `Stock availability:\n\n${list.map(p =>
            `${p.image} ${p.name}: ${p.stock > 0 ? `✅ ${p.stock} available` : '❌ Out of stock'}`
          ).join('\n')}`)
        }
        return
      }

      // Delivery / shipping
      if (/\b(delivery|deliver|shipping|ship|dispatch|arrive|when|kati din|days)\b/.test(lower)) {
        push('bot', `🚚 Delivery Info:\n\n• Kathmandu Valley: 1–2 days\n• Outside valley: 3–5 days\n• We call before delivery\n• Cash on Delivery (COD) available\n\nOnce your order is placed, we'll keep you updated! 📦`)
        return
      }

      // Product list
      if (/\b(product|item|list|show|all|what do you sell|menu|catalog)\b/.test(lower)) {
        if (visibleProducts.length === 0) {
          push('bot', `No products are live yet. Check back soon!`)
        } else {
          push('bot', `Here's everything we have:\n\n${visibleProducts.map(p =>
            `${p.image} *${p.name}*\nNPR ${p.price.toLocaleString()} · ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}`
          ).join('\n\n')}`)
        }
        return
      }

      // Order intent
      if (/\b(order|buy|purchase|want|need|book|kinnu|din)\b/.test(lower)) {
        if (productName) {
          setOrderData({ product: productName, amount: productPrice })
          setOrderStep('name')
          push('bot', `Let's order *${productName}* for NPR ${productPrice?.toLocaleString()}! 🎉\n\nWhat's your full name?`)
        } else {
          setOrderStep('product')
          push('bot', `Let's place your order! 🛍️\n\nWhich product would you like?\n\n${visibleProducts.slice(0, 6).map(p => `• ${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
        }
        return
      }

      // Thank you
      if (/\b(thank|thanks|dhanyabad|shukriya|ok|okay|great|perfect)\b/.test(lower)) {
        push('bot', `You're welcome! 😊 Is there anything else I can help you with?`)
        return
      }

      // ── Fallback ───────────────────────────────────────────────────────────
      push('bot', `I'm not sure about that yet 😅\n\nTry asking:\n• "What's the price of [product]?"\n• "Is it in stock?"\n• "How does delivery work?"\n• "I want to order"\n• "Show me your products"`)
    }, 400)
  }, [orderStep, orderData, keywords, push, shop.name, visibleProducts, addOrder, productName, productPrice])

  const quickReplies = orderStep
    ? []
    : ['products', 'price', 'stock', 'delivery', 'order']

  return { messages, sendMessage, quickReplies }
}
