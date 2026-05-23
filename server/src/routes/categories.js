import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Category } from '../models/Category.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const cats = await Category.find({ shopId: req.user._id }).sort({ order: 1, createdAt: 1 })
    res.json(cats)
  } catch {
    res.status(500).json({ message: 'Failed to fetch categories.' })
  }
})

// POST /api/categories
router.post(
  '/',
  [body('label').trim().notEmpty().withMessage('Category name is required')],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const count = await Category.countDocuments({ shopId: req.user._id })
      const cat = await Category.create({
        shopId: req.user._id,
        label:  req.body.label,
        emoji:  req.body.emoji || '🏷️',
        order:  count,
      })
      res.status(201).json(cat)
    } catch {
      res.status(500).json({ message: 'Failed to create category.' })
    }
  }
)

// PATCH /api/categories/:id
router.patch('/:id', async (req, res) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      { label: req.body.label, emoji: req.body.emoji },
      { new: true, runValidators: true }
    )
    if (!cat) return res.status(404).json({ message: 'Category not found.' })
    res.json(cat)
  } catch {
    res.status(500).json({ message: 'Failed to update category.' })
  }
})

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const cat = await Category.findOneAndDelete({ _id: req.params.id, shopId: req.user._id })
    if (!cat) return res.status(404).json({ message: 'Category not found.' })
    res.json({ message: 'Category deleted.' })
  } catch {
    res.status(500).json({ message: 'Failed to delete category.' })
  }
})

export default router
