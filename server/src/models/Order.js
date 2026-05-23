import mongoose from 'mongoose'

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled']

const orderSchema = new mongoose.Schema(
  {
    shopId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    product:  { type: String, required: true },
    amount:   { type: Number, required: true, min: 0 },
    status:   { type: String, enum: ORDER_STATUSES, default: 'Pending' },
    source:   { type: String, enum: ['bot', 'manual'], default: 'bot' },
    date:     { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Auto-generate a human-readable order ID like ORD-0042
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this._id) return next()
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments({ shopId: this.shopId })
    this.orderId = `ORD-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

orderSchema.add({ orderId: { type: String } })

export const Order = mongoose.model('Order', orderSchema)
