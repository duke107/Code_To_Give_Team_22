
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import Event from '../models/event.model.js'
import {io} from "../server.js"

const submitFeedback = async (req, res, next) => {
    try {
        const { eventId, userId, comment, rating } = req.body;

        if (!eventId || !userId || !comment) {
            return next(new ApiError(400, "Fill all required fields"));
        }
        
        const feedback = await Feedback.create({ eventId, userId, comment, rating });
        
        const event = await Event.findById(eventId);
        if (event) {
            const msg = `A new feedback has been submitted for ${event.title}`;
            const notification = await Notification.create({
                userId: event.createdBy,
                message: msg,
                type: "feedback"
            })
            io.to(event.createdBy.toString()).emit("new-notification", notification);
        }

        return res.status(201).json(new ApiResponse(201, feedback, "Feedback recorded"));
    } catch (error) {
        next(error);
    }
};

const getEventFeedbacks = async (req, res, next) => {
    try {
        const feedbacks = await Feedback.find({ eventId: req.params.eventId });

        return res.status(200).json(new ApiResponse(200, feedbacks, "Feedbacks fetched successfully"));
    } catch (error) {
        next(error);
    }
};

export { submitFeedback, getEventFeedbacks };
