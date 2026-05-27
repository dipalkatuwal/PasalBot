import mongoose from 'mongoose'

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']

const orderSchema = new mongoose.Schema(
  {
    shopId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId:  { type: String, unique: true },
    customer: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    address:  { type: String, default: '', trim: true },
    product:  { type: String, required: true },
    amount:   { type: Number, required: true, min: 0 },
    status:   { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    source:   { type: String, enum: ['bot', 'manual'], default: 'bot' },
    date:     { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Compound index for the dashboard stats queries (shopId + status + createdAt)
orderSchema.index({ shopId: 1, status: 1 })
orderSchema.index({ shopId: 1, createdAt: -1 })

/**
 * Generate a collision-safe human-readable orderId.
 * Uses findOneAndUpdate with a counter document to avoid the race condition
 * that the old countDocuments approach had under concurrent inserts.
 */
orderSchema.pre('save', async function (next) {
  if (!this.isNew || this.orderId) return next()
  try {
    // Atomic per-shop counter stored in a dedicated collection
    const Counter = mongoose.model('OrderCounter')
    const doc = await Counter.findOneAndUpdate(
      { shopId: this.shopId },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    )
    this.orderId = `ORD-${String(doc.seq).padStart(3, '0')}`
    next()
  } catch (err) {
    next(err)
  }
})

export const Order = mongoose.model('Order', orderSchema)
