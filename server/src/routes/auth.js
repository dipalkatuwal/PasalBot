import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { User, slugify } from '../models/User.js'
import { Keyword } from '../models/Keyword.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// ── Token helpers ─────────────────────────────────────────────────────────────

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

// ── POST /api/auth/register ───────────────────────────────────────────────────
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
      const existing = await User.findOne({ email }).lean()
      if (existing) return res.status(400).json({ message: 'Email already in use.' })

      const slug = slugify(shopName)
      const user = await User.create({
        email,
        password,
        shop: { name: shopName, slug, description: '' },
      })

      // Seed default bot keywords only — categories are created by the seller
      await Keyword.insertMany([
        { shopId: user._id, trigger: 'price',    reply: `Hi! 😊 Check our latest prices — or tell me which product you're interested in!`, order: 0 },
        { shopId: user._id, trigger: 'stock',    reply: `Great question! Most items are in stock. Which product do you need? I'll confirm right away 📦`, order: 1 },
        { shopId: user._id, trigger: 'delivery', reply: `We deliver within Kathmandu Valley in 1–2 days. Outside Valley: 3–5 days. COD available! 🚚`, order: 2 },
      ])

      sendToken(user, 201, res)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Server error. Please try again.' })
    }
  }
)

// ── POST /api/auth/login ──────────────────────────────────────────────────────
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

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({
    id:             req.user._id,
    email:          req.user.email,
    shop:           req.user.shop,
    activeTheme:    req.user.activeTheme,
    activeTemplate: req.user.activeTemplate,
  })
})

// ── PATCH /api/auth/shop ──────────────────────────────────────────────────────
// Allowed fields whitelist — prevents mass-assignment of arbitrary user fields.
const SHOP_FIELDS = [
  'name', 'description', 'logo', 'logoUrl', 'heroBgUrl',
  'location', 'phone', 'whatsapp', 'website', 'tagline',
  'deliveryTime', 'deliveryAreas', 'paymentMethods',
  'returnPolicy', 'howToOrder', 'businessHours', 'socialLinks',
  'freeDeliveryThreshold',
]
const TOP_FIELDS = ['activeTheme', 'activeTemplate']

router.patch('/shop', protect, async (req, res) => {
  try {
    const updates = {}

    // Handle shop name + slug regeneration with conflict check
    if (req.body.name) {
      updates['shop.name'] = req.body.name
      const newSlug = slugify(req.body.name)
      const conflict = await User.findOne(
        { 'shop.slug': newSlug, _id: { $ne: req.user._id } },
        '_id'
      ).lean()
      if (conflict) {
        return res.status(400).json({ message: 'That shop name is already taken. Please choose another.' })
      }
      updates['shop.slug'] = newSlug
    }

    // Map remaining shop sub-fields
    for (const field of SHOP_FIELDS) {
      if (field === 'name') continue // already handled above
      if (req.body[field] !== undefined) updates[`shop.${field}`] = req.body[field]
    }

    // Top-level fields (activeTheme, activeTemplate)
    for (const field of TOP_FIELDS) {
      if (req.body[field]) updates[field] = req.body[field]
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json({ shop: user.shop, activeTheme: user.activeTheme, activeTemplate: user.activeTemplate })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update shop.' })
  }
})

export default router
