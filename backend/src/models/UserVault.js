import mongoose from 'mongoose';

const UserVaultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },

  type: {
    type: String,
    enum: ['flashcard', 'video_link', 'bookmark', 'note', 'highlight'],
    required: true,
  },

  // Flashcard
  flashcard: {
    front: String,
    back: String,
    is_ai_generated: { type: Boolean, default: false },
  },

  // Video link (YouTube or other)
  video: {
    url: String,
    title: String,
    thumbnail_url: String,
    platform: { type: String, enum: ['youtube', 'other'], default: 'youtube' },
  },

  // Highlight — a piece of text from the topic
  highlight: {
    text: String,
    block_order: Number,
    color: { type: String, default: '#FEF3C7' },
  },

  // Personal note
  note: {
    text: String,
  },

  // Review tracking (for flashcards and bookmarks)
  review_status: {
    type: String,
    enum: ['not_reviewed', 'reviewing', 'mastered'],
    default: 'not_reviewed',
  },
  last_reviewed: Date,
}, { timestamps: true });

UserVaultSchema.index({ user_id: 1, topic_id: 1 });
UserVaultSchema.index({ user_id: 1, type: 1 });
UserVaultSchema.index({ user_id: 1, program_id: 1 });

export const UserVault = mongoose.models.UserVault || mongoose.model('UserVault', UserVaultSchema);
