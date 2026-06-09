import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Basic fields
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, select: false },
  avatar_url: String,

  // Role management
  role: {
    type: String,
    enum: ['student', 'parent', 'teacher', 'admin', 'superadmin'],
    default: 'student',
  },

  // Google OAuth
  google_id: { type: String, sparse: true },
  google_email: String,

  // Auth state
  is_verified: { type: Boolean, default: false },
  otp: String,
  otp_expires_at: Date,
  password_reset_token: String,
  password_reset_expires: Date,

  // Student-specific fields
  student_profile: {
    program_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    active_program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
    board: String,
    grade: String,
    class: String,
    medium: { type: String, enum: ['english', 'urdu'], default: 'english' },
    onboarding_completed: { type: Boolean, default: false },
    xp_total: { type: Number, default: 0 },
    streak_days: { type: Number, default: 0 },
    last_active: Date,
  },

  // Legacy fields for backward compatibility
  board: String,
  grade: String,
  classLevel: String,
  onboardingComplete: { type: Boolean, default: false },
  savedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],

  // Parent-specific: links to child student accounts
  linked_children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'family'], default: 'free' },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    expires_at: Date,
    ai_credits_used_today: { type: Number, default: 0 },
    ai_credits_reset_at: Date,
  },

  // Session guard — anti-account-sharing
  active_session_token: String,
  active_device_fingerprint: String,

  // Teacher-specific
  teacher_profile: {
    assigned_book_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    assigned_program_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
  },
}, { timestamps: true });

// Indexes for query performance
UserSchema.index({ google_id: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ board: 1, grade: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
