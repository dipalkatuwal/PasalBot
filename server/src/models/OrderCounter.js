import mongoose from 'mongoose'

/**
 * Atomic per-shop order sequence counter.
 * Ensures orderId values never collide under concurrent requests.
 */
const orderCounterSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  seq:    { type: Number, default: 0 },
})

export const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema)
