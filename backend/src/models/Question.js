import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', index: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', index: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', index: true },

  type: {
    type: String,
    enum: ['mcq', 'short', 'long', 'numerical', 'fill_blank', 'true_false'],
    required: true,
  },

  question: { type: String, required: true },
  options: [String],
  correct_answer: String,
  explanation: String,
  steps: [String],

  source: {
    type: String,
    enum: ['book', 'ai_generated', 'teacher', 'past_paper'],
    required: true,
  },

  // Past paper metadata (when source = 'past_paper')
  past_paper: {
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    board_short_code: String,
    year: Number,
    question_type_label: String,
  },

  is_verified: { type: Boolean, default: false },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },

  // Analytics — how students perform on this question
  total_attempts: { type: Number, default: 0 },
  correct_attempts: { type: Number, default: 0 },
  distractor_stats: [{
    option: String,
    count: Number,
  }],

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

QuestionSchema.index({ topic_id: 1, type: 1, source: 1 });
QuestionSchema.index({ topic_id: 1, is_verified: 1 });
QuestionSchema.index({ 'past_paper.board_id': 1, 'past_paper.year': 1 });

export const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
