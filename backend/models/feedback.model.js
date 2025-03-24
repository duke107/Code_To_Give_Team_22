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
    // Added for volunteer feedback
    task: {
      type: String,  // Name of the task
      required: true,
    },
    location: {
      type: String, // Location of the event
      required: true,
    },
    volunteersNeeded: {
      type: Number, // How many volunteers were initially assigned?
      required: true,
    },
    volunteerSatisfaction: {
      type: String, // "satisfactory", "not satisfactory", "average"
      enum: ["satisfactory", "not satisfactory", "average"],
      required: true,
    },
    
});

export const Feedback = mongoose.model('Feedback', FeedbackSchema);
