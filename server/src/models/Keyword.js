import mongoose from 'mongoose'

const keywordSchema = new mongoose.Schema(
  {
    shopId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trigger: { type: String, required: true, trim: true, lowercase: true },
    reply:   { type: String, required: true },
    order:   { type: Number, default: 0 }, // for display ordering
  },
  { timestamps: true }
)

export const Keyword = mongoose.model('Keyword', keywordSchema)
