import { useState, useCallback } from 'react'
import { useShop } from '@/context/ShopContext'

export function useBot({ productName, productPrice } = {}) {
  const { keywords, shop, addOrder, visibleProducts } = useShop()

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 Welcome to ${shop.name}. Ask about price, stock, delivery — or type "order" to buy!`,
    },
  ])
  const [orderStep, setOrderStep] = useState(null) // null | 'product' | 'name' | 'address' | 'phone'
  const [orderData, setOrderData] = useState({})

  const push = useCallback((from, text) => {
    setMessages(m => [...m, { from, text, id: Date.now() + Math.random() }])
  }, [])

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase()

    setTimeout(async () => {
      // ── Order flow ─────────────────────────────────────────────────────────
      if (orderStep === 'product') {
        // Customer typed a product name
        const found = visibleProducts.find(p =>
          p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase().split(' ')[0].toLowerCase())
        )
        if (!found) {
          push('bot', `Hmm, I couldn't find that product. Try one of our items:\n${visibleProducts.slice(0, 5).map(p => `• ${p.image} ${p.name} — NPR ${p.price}`).join('\n')}`)
          return
        }
        setOrderData(d => ({ ...d, product: found.name, amount: found.price }))
        setOrderStep('name')
        push('bot', `Great choice! ${found.image} ${found.name} — NPR ${found.price.toLocaleString()}\n\nWhat's your name?`)
        return
      }

      if (orderStep === 'name') {
        setOrderData(d => ({ ...d, name: text.trim() }))
        setOrderStep('address')
        push('bot', `Thanks ${text.trim()}! 🙏 What's your delivery address?`)
        return
      }

      if (orderStep === 'address') {
        setOrderData(d => ({ ...d, address: text.trim() }))
        setOrderStep('phone')
        push('bot', `Got it! And your phone number? (We'll call before delivery)`)
        return
      }

      if (orderStep === 'phone') {
        const phone = text.trim()
        const finalData = { ...orderData, phone }
        setOrderStep(null)
        setOrderData({})

        // Actually save the order to the database
        try {
          await addOrder({
            customer: finalData.name,
            phone:    phone,
            product:  finalData.product || productName || 'General Order',
            amount:   finalData.amount  || productPrice || 0,
            source:   'bot',
          })
          push('bot', `✅ Order confirmed! We'll deliver to your address in 1–2 days. Payment: COD 💚\n\nThank you for shopping at ${shop.name}! We'll call you at ${phone} before delivery.`)
        } catch {
          push('bot', `Sorry, something went wrong saving your order. Please DM us directly.`)
        }
        return
      }

      // ── Keyword triggers ───────────────────────────────────────────────────
      const match = keywords.find(k => lower.includes(k.trigger.toLowerCase()))
      if (match) {
        push('bot', match.reply)
        return
      }

      // ── Order intent ───────────────────────────────────────────────────────
      if (lower.includes('order') || lower.includes('buy') || lower.includes('किन')) {
        if (productName) {
          // Already on a product — skip to name
          setOrderData({ product: productName, amount: productPrice })
          setOrderStep('name')
          push('bot', `Let's place your order for ${productName}! 🎉 What's your name?`)
        } else {
          setOrderStep('product')
          push('bot', `Let's place your order! 🎉 Which product would you like?\n\n${visibleProducts.slice(0, 6).map(p => `• ${p.image} ${p.name} — NPR ${p.price.toLocaleString()}`).join('\n')}`)
        }
        return
      }

      // ── Product list ───────────────────────────────────────────────────────
      if (lower.includes('product') || lower.includes('item') || lower.includes('list')) {
        if (visibleProducts.length === 0) {
          push('bot', `No products are live yet. Check back soon!`)
        } else {
          push('bot', `Here's what we have:\n\n${visibleProducts.map(p => `${p.image} ${p.name} — NPR ${p.price.toLocaleString()} (${p.stock} in stock)`).join('\n')}`)
        }
        return
      }

      // ── Fallback ───────────────────────────────────────────────────────────
      push('bot', `I'm not sure about that yet 😅 Try: price · stock · delivery · order · products`)
    }, 550)
  }, [orderStep, orderData, keywords, push, shop.name, visibleProducts, addOrder, productName, productPrice])

  const quickReplies = orderStep ? [] : ['price', 'stock', 'delivery', 'order', 'products']

  return { messages, sendMessage, quickReplies }
}
