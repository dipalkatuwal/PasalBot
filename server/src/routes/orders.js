import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Order } from '../models/Order.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// GET /api/orders  (optionally ?status=Pending)
router.get('/', async (req, res) => {
  try {
    const filter = { shopId: req.user._id }
    if (req.query.status) filter.status = req.query.status
    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders)
  } catch {
    res.status(500).json({ message: 'Failed to fetch orders.' })
  }
})

// POST /api/orders
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
      // Generate orderId
      const count = await Order.countDocuments({ shopId: req.user._id })
      const orderId = `ORD-${String(count + 1).padStart(3, '0')}`

      const order = await Order.create({
        ...req.body,
        shopId: req.user._id,
        orderId,
        date: new Date(),
      })
      res.status(201).json(order)
    } catch {
      res.status(500).json({ message: 'Failed to create order.' })
    }
  }
)

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body
  const allowed = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']
  if (!allowed.includes(status)) {
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

// GET /api/orders/stats  — dashboard numbers
router.get('/stats', async (req, res) => {
  try {
    const shopId = req.user._id

    const [total, pending, delivered, revenueResult, weekAgo] = await Promise.all([
      Order.countDocuments({ shopId }),
      Order.countDocuments({ shopId, status: 'Pending' }),
      Order.countDocuments({ shopId, status: 'Delivered' }),
      Order.aggregate([
        { $match: { shopId, status: { $in: ['Confirmed', 'Delivered'] } } },
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

export default router
