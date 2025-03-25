import mongoose from 'mongoose';

const UpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false } // Optional: if you don't need separate _id for each update
);

const TaskSchema = new mongoose.Schema(
  {
    event: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Event', 
      required: true 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed'], 
      default: 'pending' 
    },
    // Fields for task proof
    proofSubmitted: { 
      type: Boolean, 
      default: false 
    },
    proofMessage: { 
      type: String 
    },
    proofImages: [{ 
      type: String 
    }],
    // New field to store task updates as an array of subdocuments
    updates: [UpdateSchema]
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', TaskSchema);
