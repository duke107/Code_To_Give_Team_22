import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Define valid skills that a volunteer can have
const validSkills = [
    "Education", "Blog", "Culture", "Rehabilitation",
    "Environment", "Audio Recording", "Field Work",
    "Sports"
];

// Define valid roles for volunteers
const validRoles = ["Admin", "User"];

const volunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    skills: [{ type: String, enum: validSkills }],
    location: { type: String, required: true },
    availability: {
        weekdays: { type: Boolean, default: false },
        weekends: { type: Boolean, default: false }
    },
    role: { type: String, enum: validRoles, default: "User" },
    emailVerified: { type: Boolean, default: false },
    registeredEvents: [{
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
    }],
    avatar: { public_id: String, url: String },
    verificationCode: Number,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date
}, { timestamps: true });

// Generate JWT token for authentication
volunteerSchema.methods.generateToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Generate a 5-digit verification code and store expiration time
volunteerSchema.methods.generateVerificationCode = async function() {
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
volunteerSchema.methods.generateResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(20).toString('hex'); // Generate a random token
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex"); // Hash it
    this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
	await this.save();
    return resetToken;
};

export const Volunteer = mongoose.model("Volunteer", volunteerSchema);