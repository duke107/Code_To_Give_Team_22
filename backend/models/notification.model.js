import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['registration', 'reminder', 'feedback', 'task-assigned', "task-complete", "event-end"],
        required: true
    },
    eventSlug: {
        type: String,
        default: '/'
    }
}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);
