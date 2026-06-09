import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  is_read: { type: Boolean, default: false },
  scroll_depth_percent: { type: Number, default: 0 },
  time_spent_seconds: { type: Number, default: 0 },

  quiz_attempts: { type: Number, default: 0 },
  highest_quiz_score: { type: Number, default: 0 },
  last_quiz_score: { type: Number, default: 0 },
  mastery_status: {
    type: String,
    enum: ['locked', 'in_progress', 'mastered'],
    default: 'locked',
  },

  // 70% quiz + 30% reading
  progress_percent: { type: Number, default: 0 },
  xp_earned: { type: Number, default: 0 },
  last_accessed: { type: Date, default: Date.now },
}, { timestamps: true });

UserProgressSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });
UserProgressSchema.index({ user_id: 1, program_id: 1 });
UserProgressSchema.index({ user_id: 1, mastery_status: 1 });
UserProgressSchema.index({ user_id: 1, chapter_id: 1 });
UserProgressSchema.index({ user_id: 1, book_id: 1 });

export const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
