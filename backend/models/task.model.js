import mongoose from 'mongoose';

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
    }
  },
  { timestamps: true }
);
export const Task = mongoose.model('Task', TaskSchema);
