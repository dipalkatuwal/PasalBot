import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Product } from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.user._id }).sort({ createdAt: -1 })
    res.json(products)
  } catch {
    res.status(500).json({ message: 'Failed to fetch products.' })
  }
})

// POST /api/products
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const product = await Product.create({ ...req.body, shopId: req.user._id })
      res.status(201).json(product)
    } catch {
      res.status(500).json({ message: 'Failed to create product.' })
    }
  }
)

// PATCH /api/products/:id
router.patch('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json(product)
  } catch {
    res.status(500).json({ message: 'Failed to update product.' })
  }
})

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, shopId: req.user._id })
    if (!product) return res.status(404).json({ message: 'Product not found.' })
    res.json({ message: 'Product deleted.' })
  } catch {
    res.status(500).json({ message: 'Failed to delete product.' })
  }
})

export default router
