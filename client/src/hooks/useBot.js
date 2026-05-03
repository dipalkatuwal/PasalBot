import { useState, useCallback } from 'react'
import { useShop } from '@/context/ShopContext'

const ORDER_FLOW_STEPS = ['name', 'address', 'phone']

/**
 * Encapsulates the bot chat logic.
 * Returns chat state and a `sendMessage` action.
 */
export function useBot() {
  const { keywords, shop } = useShop()

  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `Namaste! 🙏 Welcome to ${shop.name}. Ask about price, stock, delivery — or type "order" to buy!`,
    },
  ])
  const [orderStep, setOrderStep] = useState(null)
  const [orderData, setOrderData] = useState({})

  const push = useCallback((from, text) => {
    setMessages((m) => [...m, { from, text, id: Date.now() + Math.random() }])
  }, [])

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return
    push('user', text)
    const lower = text.toLowerCase()

    setTimeout(() => {
      // ── Order flow steps ──────────────────────────────────────────────────
      if (orderStep === 'name') {
        setOrderData((d) => ({ ...d, name: text }))
        setOrderStep('address')
        push('bot', `Thanks ${text}! 🙏 What's your delivery address?`)
        return
      }
      if (orderStep === 'address') {
        setOrderData((d) => ({ ...d, address: text }))
        setOrderStep('phone')
        push('bot', "Got it! And your phone number? (We'll call before delivery)")
        return
      }
      if (orderStep === 'phone') {
        setOrderData((d) => ({ ...d, phone: text }))
        setOrderStep(null)
        push('bot', `✅ Order confirmed! We'll deliver to your address in 1–2 days. Payment: COD 💚\n\nThank you for shopping with ${shop.name}!`)
        return
      }

      // ── Keyword triggers ──────────────────────────────────────────────────
      const match = keywords.find((k) => lower.includes(k.trigger.toLowerCase()))
      if (match) {
        push('bot', match.reply)
        return
      }

      // ── Order intent ──────────────────────────────────────────────────────
      if (lower.includes('order') || lower.includes('buy')) {
        setOrderStep('name')
        push('bot', "Let's place your order! 🎉 First, what's your name?")
        return
      }

      // ── Fallback ──────────────────────────────────────────────────────────
      push('bot', "I'm not sure about that yet 😅 Try: price · stock · delivery · order")
    }, 550)
  }, [orderStep, keywords, push, shop.name])

  const quickReplies = ['price', 'stock', 'delivery', 'order']

  return { messages, sendMessage, quickReplies }
}
