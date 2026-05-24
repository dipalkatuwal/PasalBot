import { Router } from 'express'
import { User }     from '../models/User.js'
import { Product }  from '../models/Product.js'
import { Keyword }  from '../models/Keyword.js'
import { Category } from '../models/Category.js'

const router = Router()

// GET /api/shop/:slug  — public shop data (no auth required)
router.get('/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ 'shop.slug': req.params.slug })
    if (!user) return res.status(404).json({ message: 'Shop not found.' })

    const [products, keywords, categories] = await Promise.all([
      Product.find({ shopId: user._id, visible: true }).sort({ createdAt: -1 }),
      Keyword.find({ shopId: user._id }).sort({ order: 1 }),
      Category.find({ shopId: user._id }).sort({ order: 1 }),
    ])

    res.json({
      shop: {
        name:                  user.shop.name,
        slug:                  user.shop.slug,
        logo:                  user.shop.logo,
        description:           user.shop.description,
        location:              user.shop.location,
        phone:                 user.shop.phone,
        deliveryTime:          user.shop.deliveryTime,
        deliveryAreas:         user.shop.deliveryAreas,
        paymentMethods:        user.shop.paymentMethods,
        returnPolicy:          user.shop.returnPolicy,
        howToOrder:            user.shop.howToOrder,
        businessHours:         user.shop.businessHours,
        socialLinks:           user.shop.socialLinks,
        freeDeliveryThreshold: user.shop.freeDeliveryThreshold,
        whatsapp:    user.shop.whatsapp,
        website:     user.shop.website,
        tagline:     user.shop.tagline,
        shopType:    user.shop.shopType,
      },
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
