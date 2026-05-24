import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    shopId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name:     { type: String, required: [true, 'Product name is required'], trim: true },
    price:    { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    stock:    { type: Number, default: 0, min: [0, 'Stock cannot be negative'] },
    image:    { type: String, default: '📦' },
    imageUrl: { type: String, default: '' },
    category: { type: String, default: 'General' },
    visible:  { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
