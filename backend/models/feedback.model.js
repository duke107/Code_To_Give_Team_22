import mongoose, { Schema } from 'mongoose';

const feedbackSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}, { timestamps: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
