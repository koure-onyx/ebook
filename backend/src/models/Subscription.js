import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: String, enum: ['free', 'basic', 'premium', 'family'], default: 'free' },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'active' },
  started_at: { type: Date, default: Date.now },
  expires_at: Date,
  cancelled_at: Date,
  cancel_reason: String,

  // Payment details
  payment_provider: { type: String, enum: ['stripe', 'paypal', 'jazzcash', 'easypaisa', 'manual'] },
  payment_id: String,
  amount: Number,
  currency: { type: String, default: 'PKR' },

  // Usage tracking
  ai_credits_total: { type: Number, default: 0 },
  ai_credits_used: { type: Number, default: 0 },
  download_count: { type: Number, default: 0 },

  // Auto-renewal
  auto_renew: { type: Boolean, default: true },
  renewal_reminder_sent: { type: Boolean, default: false },

  // Admin notes
  notes: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

SubscriptionSchema.index({ user_id: 1, status: 1 });
SubscriptionSchema.index({ plan: 1, status: 1 });
SubscriptionSchema.index({ expires_at: 1 });

export const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
