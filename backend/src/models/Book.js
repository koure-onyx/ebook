import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Pakistan Studies', 'Computer Science']
  },
  classLevel: {
    type: String,
    required: true
  },
  description: String,
  coverImage: String,
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board'
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

bookSchema.index({ subject: 1, classLevel: 1 });
bookSchema.index({ board: 1, program: 1 });

export const Book = mongoose.model('Book', bookSchema);
