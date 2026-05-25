import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User } from '../models/User.js'
import { Keyword } from '../models/Keyword.js'
import { Product } from '../models/Product.js'
import { Category } from '../models/Category.js'
import { protect } from '../middleware/auth.js'

const router = Router()

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function sendToken(user, status, res) {
  const token = signToken(user._id)
  res.status(status).json({
    token,
    user: {
      id:             user._id,
      email:          user.email,
      shop:           user.shop,
      activeTheme:    user.activeTheme,
      activeTemplate: user.activeTemplate,
    },
  })
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters'),
    body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email, password, shopName } = req.body
    try {
      const existing = await User.findOne({ email })
      if (existing) return res.status(400).json({ message: 'Email already in use.' })

      const slug = shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const user = await User.create({
        email,
        password,
        shop: { name: shopName, slug, description: '' },
      })

      // Seed default keywords for new shop
      await Keyword.insertMany([
        { shopId: user._id, trigger: 'price',    reply: `Hi! 😊 Check our latest prices — or tell me which product you're interested in!`, order: 0 },
        { shopId: user._id, trigger: 'stock',    reply: `Great question! Most items are in stock. Which product do you need? I'll confirm right away 📦`, order: 1 },
        { shopId: user._id, trigger: 'delivery', reply: `We deliver within Kathmandu Valley in 1–2 days. Outside Valley: 3–5 days. COD available! 🚚`, order: 2 },
      ])

      // Seed default categories for new shop
      await Category.insertMany([
        { shopId: user._id, label: 'Accessories', emoji: '👜', order: 0 },
        { shopId: user._id, label: 'Food',        emoji: '🍯', order: 1 },
        { shopId: user._id, label: 'Clothing',    emoji: '👘', order: 2 },
        { shopId: user._id, label: 'Home',        emoji: '🏠', order: 3 },
        { shopId: user._id, label: 'General',     emoji: '📦', order: 4 },
      ])

      sendToken(user, 201, res)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error. Please try again.' })
    }
  }
)

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid email or password.' })
    }

    const { email, password } = req.body
    try {
      const user = await User.findOne({ email }).select('+password')
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password.' })
      }
      sendToken(user, 200, res)
    } catch {
      res.status(500).json({ message: 'Server error. Please try again.' })
    }
  }
)

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({
    id:             req.user._id,
    email:          req.user.email,
    shop:           req.user.shop,
    activeTheme:    req.user.activeTheme,
    activeTemplate: req.user.activeTemplate,
  })
})

// ── PATCH /api/auth/shop ─────────────────────────────────────────────────────
router.patch('/shop', protect, async (req, res) => {
  const { 
    name, description, logo, logoUrl, heroBgUrl,
    activeTheme, activeTemplate,
    location, phone, whatsapp, website, tagline,
    deliveryTime, deliveryAreas, paymentMethods,
    returnPolicy, howToOrder, businessHours, socialLinks, freeDeliveryThreshold
  } = req.body
  
  try {
    const updates = {}
    if (name) {
      updates['shop.name'] = name
      // Regenerate slug and verify it isn't taken by another shop
      const newSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const conflict = await User.findOne({ 'shop.slug': newSlug, _id: { $ne: req.user._id } })
      if (conflict) {
        return res.status(400).json({ message: 'That shop name is already taken. Please choose another.' })
      }
      updates['shop.slug'] = newSlug
    }
    if (description !== undefined) updates['shop.description'] = description
    if (logo)                      updates['shop.logo']        = logo
    if (logoUrl  !== undefined)    updates['shop.logoUrl']     = logoUrl
    if (heroBgUrl !== undefined)   updates['shop.heroBgUrl']   = heroBgUrl
    if (activeTheme)               updates['activeTheme']      = activeTheme
    if (activeTemplate)            updates['activeTemplate']   = activeTemplate
    
    // Contact & branding fields
    if (location !== undefined)      updates['shop.location']      = location
    if (phone !== undefined)         updates['shop.phone']         = phone
    if (whatsapp !== undefined)      updates['shop.whatsapp']      = whatsapp
    if (website !== undefined)       updates['shop.website']       = website
    if (tagline !== undefined)       updates['shop.tagline']       = tagline

    // Delivery & policy fields
    if (deliveryTime !== undefined)  updates['shop.deliveryTime']  = deliveryTime
    if (deliveryAreas !== undefined) updates['shop.deliveryAreas'] = deliveryAreas
    if (paymentMethods !== undefined) updates['shop.paymentMethods'] = paymentMethods
    if (returnPolicy !== undefined)  updates['shop.returnPolicy']  = returnPolicy
    if (howToOrder !== undefined)    updates['shop.howToOrder']    = howToOrder
    if (businessHours !== undefined) updates['shop.businessHours'] = businessHours
    if (socialLinks !== undefined)   updates['shop.socialLinks']   = socialLinks
    if (freeDeliveryThreshold !== undefined) updates['shop.freeDeliveryThreshold'] = freeDeliveryThreshold

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json({ shop: user.shop, activeTheme: user.activeTheme, activeTemplate: user.activeTemplate })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update shop.' })
  }
})

export default router
