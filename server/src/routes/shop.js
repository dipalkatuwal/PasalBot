import { Router }   from 'express'
import { User }     from '../models/User.js'
import { Product }  from '../models/Product.js'
import { Keyword }  from '../models/Keyword.js'
import { Category } from '../models/Category.js'

const router = Router()

// Public shop fields to expose — explicit whitelist avoids leaking internal data
const PUBLIC_SHOP_FIELDS = [
  'name', 'slug', 'logo', 'logoUrl', 'heroBgUrl', 'description',
  'location', 'phone', 'deliveryTime', 'deliveryAreas', 'paymentMethods',
  'returnPolicy', 'howToOrder', 'businessHours', 'socialLinks',
  'freeDeliveryThreshold', 'whatsapp', 'website', 'tagline', 'shopType',
]

// GET /api/shop/:slug  — public shop data (no auth required)
router.get('/:slug', async (req, res) => {
  try {
    // Use lean() — we only need plain data, not a Mongoose document
    const user = await User.findOne({ 'shop.slug': req.params.slug }).lean()
    if (!user) return res.status(404).json({ message: 'Shop not found.' })

    // Fetch products, keywords, and categories in parallel
    const [products, keywords, categories] = await Promise.all([
      Product.find({ shopId: user._id, visible: true }).sort({ createdAt: -1 }).lean(),
      Keyword.find({ shopId: user._id }).sort({ order: 1 }).lean(),
      Category.find({ shopId: user._id }).sort({ order: 1 }).lean(),
    ])

    // Build shop object from whitelist — no extra fields leak out
    const shop = PUBLIC_SHOP_FIELDS.reduce((acc, key) => {
      acc[key] = user.shop[key]
      return acc
    }, {})

    res.json({
      shop,
      activeTheme:    user.activeTheme,
      activeTemplate: user.activeTemplate,
      products,
      keywords,
      categories,
    })
  } catch {
    res.status(500).json({ message: 'Failed to load shop.' })
  }
})

export default router
