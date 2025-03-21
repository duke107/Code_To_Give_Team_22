import mongoose, { Schema } from 'mongoose';

const applicationSchema = new Schema({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    role: {
        type: String,
        enum: ['participant', 'specatator', 'volunteer']
        //Todo: there should be more roles under volunteer
    }
});

export const Application = mongoose.model("Applicationn", applicationSchema);