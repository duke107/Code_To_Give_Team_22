import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const EventSummarySchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    positionsAllocated: { type: Number, required: true, default: 0 },
    totalPositions: { type: Number, required: true, default: 0 },
    volunteersRegistered: { type: Number, required: true, default: 0 },
    organizerFeel: { type: String, required: true },
    organizerEnjoyment: { type: String, required: true },
    fileUrl: { type: String }, // Optional single file URL
    eventImages: [{ type: String }], // Array of image URLs
    organiserId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // New field: ID of the event organiser
  },
  { timestamps: true }
);

const EventSummary = model('EventSummary', EventSummarySchema);

export default EventSummary;
