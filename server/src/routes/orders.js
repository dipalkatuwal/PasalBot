import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Order } from '../models/Order.js'
import { User }  from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = Router()

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']

// ── POST /api/orders/public  — unauthenticated, used by public shop bot ───────
// Must be declared BEFORE router.use(protect) and BEFORE /:id routes.
router.post(
  '/public',
  [
    body('customer').trim().notEmpty().withMessage('Customer name required'),
    body('phone').trim().notEmpty().withMessage('Phone required'),
    body('product').trim().notEmpty().withMessage('Product name required'),
    body('shopSlug').trim().notEmpty().withMessage('Shop slug required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const user = await User.findOne({ 'shop.slug': req.body.shopSlug }, '_id').lean()
      if (!user) return res.status(404).json({ message: 'Shop not found.' })

      // orderId is generated atomically in the Order pre-save hook
      const order = await Order.create({
        customer: req.body.customer,
        phone:    req.body.phone,
        address:  req.body.address || '',
        product:  req.body.product,
        amount:   req.body.amount || 0,
        source:   req.body.source || 'bot',
        shopId:   user._id,
        date:     new Date(),
      })
      res.status(201).json(order)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Failed to create order.' })
    }
  }
)

// ── GET /api/orders/stats  — must come BEFORE /:id to avoid Express matching
//    "stats" as an :id param ────────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const shopId = req.user._id

    const [total, pending, delivered, revenueResult, weekAgo] = await Promise.all([
      Order.countDocuments({ shopId }),
      Order.countDocuments({ shopId, status: 'Pending' }),
      Order.countDocuments({ shopId, status: 'Delivered' }),
      Order.aggregate([
        { $match: { shopId, status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Order.countDocuments({ shopId, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ])

    const revenue = revenueResult[0]?.total || 0
    res.json({ total, pending, delivered, revenue, weekOrders: weekAgo })
  } catch {
    res.status(500).json({ message: 'Failed to fetch stats.' })
  }
})

// All routes below require authentication
router.use(protect)

// ── GET /api/orders  (optionally ?status=Pending) ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = { shopId: req.user._id }
    if (req.query.status && ORDER_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean()
    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders.' })
  }
})

// ── POST /api/orders (manual, authenticated) ─────────────────────────────────
router.post(
  '/',
  [
    body('customer').trim().notEmpty().withMessage('Customer name required'),
    body('phone').trim().notEmpty().withMessage('Phone required'),
    body('product').trim().notEmpty().withMessage('Product name required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const order = await Order.create({
        ...req.body,
        shopId: req.user._id,
        date: new Date(),
      })
      res.status(201).json(order)
    } catch {
      res.status(500).json({ message: 'Failed to create order.' })
    }
  }
)

// ── PATCH /api/orders/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' })
  }
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      { status },
      { new: true }
    )
    if (!order) return res.status(404).json({ message: 'Order not found.' })
    res.json(order)
  } catch {
    res.status(500).json({ message: 'Failed to update order.' })
  }
})

export default router
