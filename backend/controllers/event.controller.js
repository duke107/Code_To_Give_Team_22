import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createEvent = async (req, res, next) => {
    try {
        const { title, description, startDate, endDate } = req.body;

        if (!title || !description || !startDate || !endDate) {
            return next(new ApiError(400, "Fill all required fields"));
        }

        const event = await Event.create({ title, description, startDate, endDate });
        return res.status(201).json(new ApiResponse(201, event, "Event created successfully!"));
    } catch (error) {
        next(error);
    }
};

const getEvents = async (req, res, next) => {
    try {
        const events = await Event.find();
        return res.status(200).json(new ApiResponse(200, events, "Events retrieved successfully!"));
    } catch (error) {
        next(error);
    }
};

const getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return next(new ApiError(404, "Event not found"));
        }

        return res.status(200).json(new ApiResponse(200, event, "Event retrieved successfully!"));
    } catch (error) {
        next(error);
    }
};

const updateEvent = async (req, res, next) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });

        if (!updatedEvent) {
            return next(new ApiError(404, "Event not found"));
        }

        return res.status(200).json(new ApiResponse(200, updatedEvent, "Event updated successfully!"));
    } catch (error) {
        next(error);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);
        if (!deletedEvent) {
            return next(new ApiError(404, "Event not found"));
        }

        return res.status(200).json(new ApiResponse(200, deletedEvent, "Event deleted successfully"));
    } catch (error) {
        next(error);
    }
};

export { createEvent, getEvents, getEventById, updateEvent, deleteEvent };
