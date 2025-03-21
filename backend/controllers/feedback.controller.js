import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const submitFeedback = async (req, res, next) => {
    try {
        const { eventId, userId, comment, rating } = req.body;

        if (!eventId || !userId || !comment) {
            return next(new ApiError(400, "Fill all required fields"));
        }

        const feedback = await Feedback.create({ eventId, userId, comment, rating });

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
