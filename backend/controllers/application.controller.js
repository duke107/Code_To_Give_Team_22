import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const applyForEvent = async (req, res, next) => {
    try {
        const { eventId, userId, role } = req.body;

        if (!eventId || !userId || !role) {
            return next(new ApiError(400, "Event ID, User ID, and role are required"));
        }

        const existingApplication = await Application.findOne({ eventId, userId });
        if (existingApplication) {
            return next(new ApiError(400, "Already applied for this event"));
        }

        const application = await Application.create({ eventId, userId, role });
        return res.status(201).json(new ApiResponse(201, application, "Application submitted successfully"));
    } catch (error) {
        next(error);
    }
};
const getEventApplications = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const applications = await Application.find({ eventId });

        return res.status(200).json(new ApiResponse(200, applications, "Applications fetched successfully"));
    } catch (error) {
        next(error);
    }
};



export { applyForEvent, getEventApplications };
