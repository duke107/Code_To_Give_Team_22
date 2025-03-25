import stripe from "stripe";
import dotenv from "dotenv";
import { Donation } from "../models/donation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";

dotenv.config({ path: "./config/config.env" });

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

const makeDonation = async (req, res, next) => {
    try {
        const { amount, donorName, email, message, eventId } = req.body;

        if (!amount || !donorName || !email) {
            return next(new ApiError(400, "Amount, donor name, and email are required"));
        }

        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: amount * 100,
            currency: "INR",
            receipt_email: email,
            metadata: { donorName, message },
            payment_method_types: ["card"],  //payment method needed for stripe
        });

        const newDonation = new Donation({
            donorName,
            email,
            amount,
            orderId: paymentIntent.id,
            paymentId: paymentIntent.id,  //*using orderid as payment id becuase its unique
            status: "created",
            message: message || "Supporting a good cause",
            eventId: eventId || null,
        });

        await newDonation.save();
        //saving the payment details to db

        if (eventId) {
            await Event.findByIdAndUpdate(
                eventId,
                { $inc: { donation: amount } },
                { new: true, runValidators: true }
            );
        }

        return res.status(200).json(
            new ApiResponse(200, {
                order_id: paymentIntent.id,
                amount,
                currency: "INR",
                key_id: process.env.STRIPE_PUBLISHABLE_KEY,
                donorName,
                email,
                message: message || "Supporting a good cause",
                clientSecret: paymentIntent.client_secret,
            }, "Donation initiated successfully")
        );

    } catch (error) {
        console.error("Error in initialising Donation:", error);
        return next(new ApiError(500, "Error initiating donation"));
    }
};

export const getDonations = async (req, res, next) => {
    try {
      const user = req.user; // Populated by isAuthenticated middleware
  
      let donations;
  
      // If the user is admin, return all donations
      if (user.role && user.role === "Admin") {
        donations = await Donation.find({});
      } else {
        // For event organisers: fetch events created by this user
        const events = await Event.find({ createdBy: user._id });
        const eventIds = events.map((event) => event._id);
  
        // Fetch donations for these events
        donations = await Donation.find({ eventId: { $in: eventIds } });
      }
  
      // Optionally, aggregate donation value if needed:
      const totalDonationAmount = donations.reduce((acc, donation) => acc + donation.amount, 0);
  
      return res.status(200).json(
        new ApiResponse(200, { donations, totalDonationAmount }, "Donations fetched successfully")
      );
    } catch (error) {
      console.error("Error fetching donations:", error);
      return next(new ApiError(500, "Error fetching donations"));
    }
  };

export default makeDonation


export const getDonors = async (req, res, next) => {
    console.log("hit")
    try {
      const user = req.user; // from isAuthenticated middleware
      let donations;

    if (user.role && user.role === "Admin") {
      // Admin gets all donations
      donations = await Donation.find({});
    } else {
      // For event organisers, fetch events they created
      const events = await Event.find({ createdBy: user._id });
      const eventIds = events.map(event => event._id);
        donations = await Donation.find({ eventId: { $in: eventIds } });
        console.log("fetched")
    }

    // Return donation details (donorName, amount, message, etc.)
    return res.status(200).json(
      new ApiResponse(200, { donations }, "Donor details fetched successfully")
    );
    } catch (error) {
      console.error("Error fetching organiser donors:", error);
      return next(new ApiError(500, "Error fetching organiser donors"));
    }
};
  
export const getDonationsForAdmin = async (req, res, next) => {
  try {
    let donations = await Donation.find({});

    const totalDonationAmount = donations.reduce((acc, donation) => acc + donation.amount, 0);

    return res.status(200).json(
      new ApiResponse(200, { donations, totalDonationAmount }, "Donations fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching donations:", error);
    return next(new ApiError(500, "Error fetching donations"));
  }
};