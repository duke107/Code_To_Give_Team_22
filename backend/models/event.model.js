import mongoose from "mongoose";

const eventCategories = [
  "Education & Skill Development",
  "Sports & Cultural Events",
  "Health & Well-being",
  "Women Empowerment",
  "Environmental Sustainability",
  "Social Inclusion & Awareness"
];

// Sub-schema for volunteering positions, now with a registeredUsers field
const VolunteeringPositionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slots: { type: Number, required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Main event schema
const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: eventCategories, required: true },
    slug: { type: String, unique: true },
    content: { type: String },
    image: { type: String },
    eventLocation: { type: String, required: true },
    eventStartDate: { type: Date, required: true },
    eventEndDate: { type: Date, required: true },
    volunteeringPositions: [VolunteeringPositionSchema],
    // Optional: global list of registered volunteers (if needed)
    registeredVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Field to store the user who created the event
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isApproved: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    // New field to indicate if a summary has been published
    isSummaryPublished: { type: Boolean, default: false },
    donation: {type: Number, default: 0},
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
