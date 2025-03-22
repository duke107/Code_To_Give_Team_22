import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    location: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    accountVerified: { type: Boolean, default: false },
    organizedEvents: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Event" 
    }],
    avatar: { public_id: String, url: String },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date
}, { timestamps: true });

// Generate JWT token for authentication
organizerSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Generate a 5-digit verification code and store expiration time
organizerSchema.methods.generateVerificationCode = async function() {
    function generateRandomFiveDigitNumber() {
        const firstDigit = Math.floor(Math.random() * 9) + 1; // Ensure the first digit is not 0
        const remainingDigits = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0"); // Ensure it's always 5 digits
        return parseInt(firstDigit + remainingDigits);
    }

    const verificationCode = generateRandomFiveDigitNumber();
    this.verificationCode = verificationCode;
    this.verificationCodeExpire = Date.now() + 15 * 60 * 1000; // Code expires in 15 minutes
	await this.save();
    return verificationCode;
};

// Generate a token for password reset
organizerSchema.methods.generateResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(20).toString('hex'); // Generate a random token
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // Hash it
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
	await this.save();
    return resetToken;
};

export const Organizer = mongoose.model("Organizer", organizerSchema);