import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  stripeCustomerId: String,
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'trialing', 'past_due'],
    default: 'active'
  },
  plan: String,
  interval: {
    type: String,
    enum: ['month', 'year']
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1 });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
