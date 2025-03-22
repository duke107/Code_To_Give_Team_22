import stripe from "stripe";
import dotenv from "dotenv";
import { Donation } from "../models/donation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dotenv.config({ path: "./config/config.env" });

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

const makeDonation = async (req, res, next) => {
    try {
        const { amount, donorName, email, message } = req.body;

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
        });

        await newDonation.save();
        //saving the payment details to db

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

export default makeDonation;
