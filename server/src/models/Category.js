import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label:  { type: String, required: true, trim: true },
    emoji:  { type: String, default: '🏷️' },
    order:  { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Category = mongoose.model('Category', categorySchema)
