import Event from '../models/event.model.js'

import { User } from '../models/user.model.js'; // adjust the path as needed
import { Task } from '../models/task.model.js';
import mongoose from 'mongoose';
import { Feedback } from '../models/feedback.model.js';
import { Notification } from '../models/notification.model.js';
import { sendRegistrationNotification } from './notification.controller.js';
import {io} from "../server.js"
import { Testimonial } from '../models/testimonial.model.js';
import EventSummary from '../models/eventSummary.model.js';


// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      content,
      image,
      eventLocation,
      eventStartDate,
      eventEndDate,
      volunteeringPositions, // expecting an array of positions
      user_id, // expecting user_id in the request body
    } = req.body;

    // Basic validation for required fields
    // console.log(user_id);
    if (!title || !eventLocation || !eventStartDate || !eventEndDate || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure volunteeringPositions is an array and initialize each position's registeredUsers to []
    let processedVolunteeringPositions = [];
    if (volunteeringPositions && Array.isArray(volunteeringPositions)) {
      processedVolunteeringPositions = volunteeringPositions.map((position) => ({
        title: position.title,
        slots: position.slots,
        registeredUsers: [] // initialize registeredUsers as empty array
      }));
    }

    const event = await Event.create({
      title,
      content,
      image,
      eventLocation,
      eventStartDate,
      eventEndDate,
      volunteeringPositions: processedVolunteeringPositions,
      createdBy: user_id, // storing the id of the user who created the event
    });

    // After creating the event, notify users in the same area
    const usersInArea = await User.find({
      location: eventLocation,
      _id: { $ne: user_id }
    });

    // For each user, create a notification about the new event
    for (const user of usersInArea) {
      const notification = await Notification.create({
        userId: user._id,
        message: `New event "${event.title}" is listed in your area.`,
        type: "reminder"
      });
      io.to(user._id.toString()).emit("new-notification", notification);
    }

    return res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug })
      .populate("createdBy", "name email")
      .populate("registeredVolunteers", "name email")
      .populate("volunteeringPositions.registeredUsers", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Convert event to plain object for modification
    const eventObj = event.toObject();

    // For each volunteering position, attach tasks for each registered volunteer.
    await Promise.all(
      eventObj.volunteeringPositions.map(async (position) => {
        position.registeredUsers = await Promise.all(
          position.registeredUsers.map(async (volunteer) => {
            const volunteerIdStr = volunteer._id.toString();
            const eventIdStr = eventObj._id.toString();
            console.log(
              "Fetching tasks for volunteer:",
              volunteerIdStr,
              "and event:",
              eventIdStr
            );
            const eventObjectId = new mongoose.Types.ObjectId(eventIdStr);
            const volunteerObjectId = new mongoose.Types.ObjectId(volunteerIdStr);

            // Ensure to include the proof fields by specifying them in the projection
            const tasks = await Task.find(
              {
                event: eventObjectId,
                assignedTo: volunteerObjectId
              },
              "description status proofSubmitted proofMessage proofImages"
            ).exec();
            console.log("Found tasks:", tasks);
            return { ...volunteer, tasks };
          })
        );
        return position;
      })
    );

    return res.status(200).json(eventObj);
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update an existing event by ID
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;

    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an event by ID
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    // Build a query object based on query parameters
    const query = {};
    if (req.query.createdBy) {
      query.createdBy = req.query.createdBy;
    }
    if (req.query.location) {
      query.eventLocation = req.query.location;
    }

    // Fetch events from the database based on the query, sorted by creation date
    const events = await Event.find(query).sort({ createdAt: -1 });

    return res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const registerVolunteer = async (req, res) => {
  try {
    const { id, positionId } = req.body; // expecting volunteer id and position id
    const { slug } = req.params;

    // Find the event by slug
    const event = await Event.findOne({ slug });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the specific volunteering position by its _id
    const position = event.volunteeringPositions.id(positionId);
    if (!position) {
      return res.status(404).json({ message: "Volunteering position not found" });
    }

    // Check if there are available slots for this position
    if (position.slots <= 0) {
      return res.status(409).json({ message: "No available slots for this position" });
    }

    // Check if the volunteer is already registered for this position
    if (position.registeredUsers.includes(id)) {
      return res.status(409).json({ success: false, message: "Volunteer already registered for this position" });
    }

    // Register the volunteer for the specified position
    position.registeredUsers.push(id);
    // Decrement the available slots for that position
    position.slots = position.slots - 1;

    // Optionally, update global registeredVolunteers if not already included
    if (!event.registeredVolunteers.includes(id)) {
      event.registeredVolunteers.push(id);
    }

    await event.save();

    //sending a notification to the creator about new joinee
    await sendRegistrationNotification(event, req.body.id);

    //socket io part:
    console.log("emitting notification")
    io.to(event.createdBy.toString()).emit("new-notification", {
      message: `A new volunteer registered for your event "${event.title}".`,
      type: "registration"
    });

    // Now, update the user document to include this event in the user's events array
    const userDoc = await User.findById(id);
    if (userDoc) {
      const alreadyRegistered = userDoc.events.some(
        (e) => e.eventId.toString() === event._id.toString()
      );
      if (!alreadyRegistered) {
        userDoc.events.push({
          eventId: event._id,
          eventDate: new Date(),
          tasks: [] // initialize with an empty array for tasks
        });
        await userDoc.save();
      }
    }

    return res.status(200).json({ success: true, message: "Volunteer registered" });
  } catch (error) {
    console.error("Error registering volunteer:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const assignTask = async (req, res) => {
  try {
    const { volunteerId, eventId, tasks } = req.body;

    // Validate required fields
    if (!volunteerId || !eventId || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: "Missing required fields or tasks is not an array" });
    }

    // Filter out any tasks with empty descriptions
    const validTasks = tasks
      .map(task => task.description.trim())
      .filter(desc => desc);

    if (validTasks.length === 0) {
      return res.status(400).json({ message: "Please provide at least one valid task description." });
    }

    // Create tasks for each valid description
    const createdTasks = [];
    for (const description of validTasks) {
      const task = await Task.create({
        event: eventId,
        assignedTo: volunteerId,
        description,
        status: 'pending', // default status
      });
      createdTasks.push(task);
    }

    // Find the user document for the volunteer
    const user = await User.findById(volunteerId);
    if (!user) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    // Find the event entry in the user's events array
    let userEvent = user.events.find(
      (ev) => ev.eventId.toString() === eventId.toString()
    );

    // Prepare an array of task references to add
    const taskRefs = createdTasks.map(task => ({ taskId: task._id }));

    if (userEvent) {
      // If the event entry exists, push all new tasks' references
      userEvent.tasks.push(...taskRefs);
    } else {
      // If not, create a new event entry with the tasks
      user.events.push({
        eventId,
        eventDate: new Date(),
        tasks: taskRefs,
      });
    }

    await user.save();

    const event = await Event.findById(eventId);
    if (event) {
      const notifMsg = `You have been assigned new tasks for event "${event.title}"`;
      // Create a notification for the volunteer
      await Notification.create({
        userId: volunteerId,
        message: notifMsg,
        type: "task-assigned"
      });
      //emit notification from socketio 
      io.to(volunteerId.toString()).emit("new-notification", {
        message: notifMsg,
        type: "task-assigned",
        isRead: false
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tasks assigned successfully",
      tasks: createdTasks
    });
  } catch (error) {
    console.error("Error assigning task:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    console.log('====================================');
    console.log("here");
    console.log('====================================');

    // Validate that status is provided and is one of the allowed values
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }
    if (!['pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value. Must be 'pending' or 'completed'." });
    }

    const task = await Task.findById(taskId);
    if(!task)
      return res.status(404).json({ message: "Task not found." });
    const previousStatus = task.status;

    task.status = status; //update status here
    const updatedTask = await task.save();

    //now generate notification only if task has been completed
    if (previousStatus === "pending" && status === "completed") {
      const event = await Event.findById(task.event);
      if (event) {
        const msg = `Task "${task.description}" for event "${event.title}" has been marked completed by "${task.assignedTo}"`;
        const notification = await Notification.create({
          userId: event.createdBy,
          message: msg,
          type: "task-complete"
        })

        io.to(event.createdBy.toString(), notification);
      }
    }

    return res.status(200).json({ message: "Task status updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFeedback = async (req, res) => {
  try {
    const { eventId, userId, rating, enjoyed, comments, suggestions } = req.body;

    // Validate required fields
    if (!eventId || !userId || rating === undefined || enjoyed === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: eventId, userId, rating, and enjoyed are required.'
      });
    }

    // Create new feedback instance
    const feedback = new Feedback({
      eventId,
      userId,
      rating,
      enjoyed,
      comments: comments || '',
      suggestions: suggestions || '',
    });

    // Save feedback to the database
    await feedback.save();

    const event = await Event.findById(eventId);
    if (event) {
      const msg = `A new anonymous feedback has been submitted for your event "${event.title}".`;
      // Create a notification document for the event creator
      await Notification.create({
        userId: event.createdBy,
        message: msg,
        type: "feedback"
      });
      // Emit the notification in real time via Socket.IO
      io.to(event.createdBy.toString()).emit("new-notification", {
        message: msg,
        type: "feedback",
        isRead: false
      });
    }

    return res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeedbacksForEvent = async (req, res) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    // Find feedback associated with the given event ID, sorted by creation date (most recent first)
    const feedbacks = await Feedback.find({ eventId }).sort({ createdAt: -1 });

    return res.status(200).json(feedbacks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const submitTestimonial = async (req, res) => {
  try {
    const { name, eventId, eventTitle, volunteeringPosition, testimonial, userId } = req.body;

    // Validate required fields
    if (!name || !eventId || !volunteeringPosition || !testimonial || !userId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Create a new testimonial document
    const newTestimonial = new Testimonial({
      name,
      eventId,
      eventTitle,
      volunteeringPosition,
      testimonial,
      userId,
    });

    await newTestimonial.save();

    return res.status(201).json({ message: 'Testimonial submitted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRecentTestimonials = async (req, res) => {
  try {
    // Find the latest 10 testimonials
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(testimonials);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const createEventSummary = async (req, res) => {
  try {
    const {
      eventId,
      eventName,
      location,
      startDate,
      endDate,
      positionsAllocated,
      totalPositions,
      volunteersRegistered,
      organizerFeel,
      organizerEnjoyment,
      fileUrl,      // Optional: single file URL
      eventImages,  // Array of image URLs
      organiserId,  // Event organiser's user ID
    } = req.body;

    // Check if an event summary already exists for this event
    const existingSummary = await EventSummary.findOne({ eventId });
    if (existingSummary) {
      return res.status(400).json({
        success: false,
        message: "Event summary already provided for this event",
      });
    }

    // Create new EventSummary document including organiserId
    const eventSummary = new EventSummary({
      eventId,
      eventName,
      location,
      startDate,
      endDate,
      positionsAllocated,
      totalPositions,
      volunteersRegistered,
      organizerFeel,
      organizerEnjoyment,
      fileUrl,
      eventImages,
      organiserId,
    });

    const savedSummary = await eventSummary.save();

    res.status(201).json({
      success: true,
      message: 'Event summary created successfully',
      data: savedSummary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getTasksUser = async (req, res) => {
  try {
    // Filter tasks by the logged-in user's ID
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("event", "title eventStartDate eventEndDate")
      .populate("assignedTo", "name email");
      
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getEventsUser = async (req, res) => {
  try {
    // Populate the createdBy field and the registered users in each volunteering position
    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("volunteeringPositions.registeredUsers", "name email");
      
    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitTaskProof = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message, proofImages } = req.body;

    // Update the task with the submitted proof data
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        proofMessage: message,
        proofImages,
        proofSubmitted: true,
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task proof submitted successfully. Waiting for approval.",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const approveTaskProof = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Approve the proof: mark task as completed
    task.status = 'completed';
    // Optionally, you could leave the proof fields intact or clear them
    // For example: task.proofSubmitted = true; (it should already be true)
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Proof approved. Task marked as completed.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectTaskProof = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Reject the proof: reset proofSubmitted to false,
    // clear the proofImages and proofMessage,
    // and keep the task status as 'pending'
    task.proofSubmitted = false;
    task.proofImages = [];
    task.proofMessage = "";
    task.status = 'pending'; // Ensuring the task remains pending
    await task.save();

    return res.status(200).json({
      success: true,
      message: "Proof rejected. Task remains pending. Proof has been cleared.",
      data: task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
