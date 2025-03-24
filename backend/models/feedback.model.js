import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  enjoyed: {
    type: Boolean,
    required: true,
  },
  comments: {
    type: String,
    default: '',
  },
  // Suggestions for improvements or changes. Always provided.
  suggestions: {
    type: String,
    default: '',
  },
 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
