import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sendNotification = async (req, res, next) => {
    try {
        // TODO: Handle system-generated notifications based on new enrollment and upcoming events using MongoDB aggregate pipelines
    } catch (error) {
        next(new ApiError(500, "Error sending notifications"));
    }
};

const getAllNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id; // Considering we sent user in the req too
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        //! Frontend shall send a PATCH request at /notifications/:notificationId
        const updatedNotification = await Notification.findByIdAndUpdate(
            req.params.notificationId,
            { isRead: true },
            { new: true }
        );

        if (!updatedNotification) {
            return next(new ApiError(404, "Notification not found"));
        }

        return res.status(200).json(new ApiResponse(200, updatedNotification, "Notification updated successfully"));
    } catch (error) {
        next(error);
    }
};

const deleteNotification = async (req, res, next) => {
    try {
        //! Frontend shall send a DELETE request at /notifications/:notificationId
        const { notificationId } = req.params;
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return next(new ApiError(404, "Notification not found"));
        }

        return res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
    } catch (error) {
        next(error);
    }
};

export { sendNotification, getAllNotifications, markNotificationAsRead, deleteNotification };
