import mongoose from "mongoose";

// Sub-schema for volunteering positions
const VolunteeringPositionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slots: { type: Number, required: true },
});

// Main event schema
const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String },
    image: { type: String },
    eventLocation: { type: String, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    volunteeringPositions: [VolunteeringPositionSchema],
    registeredVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // New field to store the user who created the event.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Pre-validate hook to create a slug from the title
EventSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = this.title
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "");
  }
  next();
});

export default mongoose.model("Event", EventSchema);
