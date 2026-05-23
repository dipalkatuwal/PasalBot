import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { Keyword } from '../models/Keyword.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)

// GET /api/keywords
router.get('/', async (req, res) => {
  try {
    const keywords = await Keyword.find({ shopId: req.user._id }).sort({ order: 1 })
    res.json(keywords)
  } catch {
    res.status(500).json({ message: 'Failed to fetch keywords.' })
  }
})

// PUT /api/keywords  — full replace (save all at once)
router.put(
  '/',
  [
    body('*.trigger').trim().notEmpty().withMessage('Trigger is required'),
    body('*.reply').trim().notEmpty().withMessage('Reply is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      await Keyword.deleteMany({ shopId: req.user._id })
      const toInsert = req.body.map((k, i) => ({
        shopId:  req.user._id,
        trigger: k.trigger.toLowerCase().trim(),
        reply:   k.reply,
        order:   i,
      }))
      const keywords = await Keyword.insertMany(toInsert)
      res.json(keywords)
    } catch {
      res.status(500).json({ message: 'Failed to save keywords.' })
    }
  }
)

// POST /api/keywords  — add one
router.post(
  '/',
  [
    body('trigger').trim().notEmpty().withMessage('Trigger is required'),
    body('reply').trim().notEmpty().withMessage('Reply is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

    try {
      const count = await Keyword.countDocuments({ shopId: req.user._id })
      const keyword = await Keyword.create({
        shopId:  req.user._id,
        trigger: req.body.trigger.toLowerCase().trim(),
        reply:   req.body.reply,
        order:   count,
      })
      res.status(201).json(keyword)
    } catch {
      res.status(500).json({ message: 'Failed to create keyword.' })
    }
  }
)

// DELETE /api/keywords/:id
router.delete('/:id', async (req, res) => {
  try {
    const kw = await Keyword.findOneAndDelete({ _id: req.params.id, shopId: req.user._id })
    if (!kw) return res.status(404).json({ message: 'Keyword not found.' })
    res.json({ message: 'Keyword deleted.' })
  } catch {
    res.status(500).json({ message: 'Failed to delete keyword.' })
  }
})

export default router
