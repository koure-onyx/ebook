import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  googleId: {
    type: String,
    sparse: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'expired', 'trialing'],
    default: 'active'
  },
  classLevel: String,
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
