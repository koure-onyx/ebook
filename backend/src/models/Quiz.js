import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', index: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', index: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', index: true },

  score: { type: Number, required: true, min: 0, max: 100 },
  answers: [{
    questionId: { type: String, required: true },
    selected: { type: String, required: true },
    isCorrect: Boolean,
    timeSpent: Number,
  }],

  time_spent: { type: Number, default: 0 },
  correct_count: { type: Number, default: 0 },
  total_questions: { type: Number, default: 0 },

  // Performance analytics
  accuracy_percentage: { type: Number },
  difficulty_breakdown: [{
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    correct: Number,
    total: Number,
  }],

  // Metadata
  device_info: {
    platform: String,
    browser: String,
  },

  created_at: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

QuizSchema.index({ user_id: 1, created_at: -1 });
QuizSchema.index({ user_id: 1, topic_id: 1 });
QuizSchema.index({ topic_id: 1, created_at: -1 });
QuizSchema.index({ score: -1 });

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
