import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const validSkills = [
	"Education", "Blog", "Culture", "Rehabilitation",
	"Environment", "Audio Recording", "Field Work",
	"Sports"
];

const validRoles = ["Admin", "User"];

const volunteerSchema = new mongoose.Schema({
		name: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: true, unique: true},
		password: { type: String, required: true, select: false },
		skills: [{ type: String, enum: validSkills }],
		location: { type: String, required: true },
		availability: {
			weekdays: { type: Boolean, default: false },
			weekends: { type: Boolean, default: false }
		},
		role: { type: String, enum: validRoles, default: "User" },
		accountVerified: { type: Boolean, default: false },
		registeredEvents: [{
				eventId: { type:mongoose.Schema.Types.ObjectId, ref:"Event" },
				assignedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }]
		}],
		avatar: { public_id: String, url: String },
		verificationCode: Number,
		verificationCodeExpire: Date,
		resetPasswordToken: String,
		resetPasswordExpire: Date
	} 
	, { timestamps: true });

volunteerSchema.methods.generateToken = function() {
	return jwt.sign({ id:this._id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRE
	});
}

volunteerSchema.methods.generateVerificationCode = function() {
	function generateRandomFiveDigitNumber() {
		const firstDigit = Math.floor(Math.random() * 9) + 1;
		const remainingDigits = Math.floor(Math.random() * 10000)
			.toString()
			.padStart(4, "0");
		return parseInt(firstDigit + remainingDigits);
	}

	const verificationCode = generateRandomFiveDigitNumber();
	this.verificationCode = verificationCode;
	this.verificationCodeExpire = Date.now() + 15 * 60 * 1000;
	return verificationCode;
};


volunteerSchema.methods.generateResetPasswordToken = function() {
	const resetPasswordToken = crypto.randomBytes(20).toString('hex');
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
	return resetPasswordToken;
}

export const volunteerModel = mongoose.model("Volunteer", volunteerSchema);