import Event from '../models/event.model.js'
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
      volunteeringPositions,
      user_id, // expecting user_id in the request body
    } = req.body;

    // Basic validation for required fields
    if (!title || !eventLocation || !eventStartDate || !eventEndDate || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.create({
      title,
      content,
      image,
      eventLocation,
      eventStartDate,
      eventEndDate,
      volunteeringPositions,
      createdBy: user_id, // storing the id of the user who created the event
    });

    return res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get an event by slug
export const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await Event.findOne({ slug }).populate("createdBy");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
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
    const { id } = req.body;
    const { slug } = req.params;
    const event = await Event.findOne({ slug });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.registeredVolunteers.includes(id)) {
      return res.status(409).json({ success: false, message: "Volunteer already registered" });
    }
    event.registeredVolunteers.push(id);
    await event.save();
    return res.status(200).json( {success: true, message: "Volunteer registered"} );
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}