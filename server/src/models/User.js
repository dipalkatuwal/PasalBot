import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned by default
    },
    shop: {
      name:        { type: String, default: 'My Pasal' },
      slug:        { type: String, unique: true, sparse: true },
      logo:        { type: String, default: '🏪' },
      logoUrl:     { type: String, default: '' },
      heroBgUrl:   { type: String, default: '' },
      description: { type: String, default: '' },
      location:    { type: String, default: '' },
      phone:       { type: String, default: '' },
      deliveryTime:  { type: String, default: '1-3 days' },
      deliveryAreas: { type: String, default: 'Inside Kathmandu Valley' },
      paymentMethods: { type: [String], default: ['COD'] },
      returnPolicy:  { type: String, default: 'Return/exchange within 3 days' },
      howToOrder:    { type: String, default: 'Order via the shop bot or DM us' },
      businessHours: { type: String, default: '10 AM - 8 PM' },
      socialLinks: {
        facebook:  { type: String, default: '' },
        instagram: { type: String, default: '' },
      },
      freeDeliveryThreshold: { type: Number, default: 0 },
      whatsapp:    { type: String, default: '' },
      website:     { type: String, default: '' },
      tagline:     { type: String, default: '' },
      shopType:    { type: String, default: '' },
    },
    activeTheme:    { type: String, default: 'mountain' },
    activeTemplate: { type: String, default: 'grid' },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Auto-generate slug from shop name on first save
// NOTE: slug updates on name change are handled in the auth route to allow
// conflict-checking before the write — don't regenerate here on update.
userSchema.pre('save', function (next) {
  if (this.isNew && !this.shop.slug && this.shop.name) {
    this.shop.slug = slugify(this.shop.name)
  }
  next()
})

/**
 * Shared slug utility — used in both the model hook and the auth route.
 * Exported so the route can reuse it without reimplementing the same regex.
 */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const User = mongoose.model('User', userSchema)
