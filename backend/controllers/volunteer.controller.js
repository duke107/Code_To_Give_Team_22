import { Volunteer } from "../models/volunteer.model.js";
import { sendToken } from "../utils/sendToken.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendPasswordReset } from "../utils/sendPasswordReset.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const register = async (req, res) => {
    try {
        const { name, phone, email, password, skills, location, availability } = req.body;
        if (!name || !phone || !email || !password || !location) {
            return res.status(400).json({ 
                success: false,
                message: "Provide all required fields" 
            });
        }
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ 
                success: false,
                message: "Password must be between 8 and 16 characters" 
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const volunteer = await Volunteer.create({ 
            name,  phone, email, password: hashedPassword, skills, location, availability
        });
        const verificationCode = await volunteer.generateVerificationCode();
        return await sendVerificationCode(verificationCode, email, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Volunteer already exists"
            });
        } else {
            console.log("Something went wrong", error.stack);
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            });
        }
    }
};

export const mailVerificationCode = async (req, res) => {
    const { email } = req.body;
    try {
        if(!email)  {
            return res.status(400).json({ 
                success: false, 
                message: "Provide email" 
            });
        }
        const volunteer = await Volunteer.findOne({ email });

        if(!volunteer) {
            return res.status(400).json({ 
                success: false, 
                message: "No volunteer found"                 
            });
        }

        if(volunteer.emailVerified) {
            return res.status(200).json({ 
                success: true, 
                message: "Email has already been verified"                 
            });
        }

        const verificationCode = await volunteer.generateVerificationCode();
        return await sendVerificationCode(verificationCode, email, res);
    } catch(error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}

export const verifyVerificationCode = async (req, res) => {
    const { email, verificationCode } = req.body;
    try {
        if(!email || !verificationCode)  {
            return res.status(400).json({ 
                success: false, 
                message: "Provide email and verification code" 
            });
        }

        const volunteer = await Volunteer.findOne({ email });

        if(!volunteer) {
            return res.status(400).json({ 
                success: false, 
                message: "No volunteer found" 
            });
        }

        if(volunteer.emailVerified) {
            return res.status(200).json({ 
                success: true, 
                message: "Email has already been verified" 
            });
        }

        if(volunteer.verificationCode !== Number(verificationCode)) {
            return res.status(400).json({ 
                success: false, 
                message: "Incorrect verification code" 
            });
        }

        const currentTime = Date.now();
        const verificationCodeExpireTime = new Date(volunteer.verificationCodeExpire);

        if(currentTime > verificationCodeExpireTime) {
            return res.status(400).json({ 
                success: false, 
                message: "Verification code expired" 
            });
        }

        volunteer.verificationCode = null;
        volunteer.verificationCodeExpire = null;
        volunteer.emailVerified = true;
        await volunteer.save({ validateModifiedOnly: true });

        return res.status(200).json({ success: true, message: "Email successfully verified" });
    } catch(error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Provide email and password" 
            });
        }
        const volunteer = await Volunteer.findOne({ email, emailVerified: true }).select("+password");

        if (!volunteer) {
            return res.status(400).json({ 
                sucess: false, 
                message: "Incorrect email or password" 
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, volunteer.password);

        if (!isPasswordMatched) {
            return res.status(400).json({ 
                sucess: false, 
                message: "Incorrect email or password" 
            });
        }
        sendToken(volunteer, 200, "Volunteer logged in successfully", res);
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const getVolunteer = async (req, res) => {  
    try {
        const { id } = req;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID is required" 
            });
        }
        const volunteer = await Volunteer.findById(id);
        if (!volunteer) {
            return res.status(404).json({ 
                success: false, 
                message: "Volunteer not found" 
            });
        }
        return res.status(200).json({ volunteer });
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const mailPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const volunteer = await Volunteer.findOne({
            email,
            emailVerified: true,
        });
        
        if (!volunteer) {
            return res.status(400).json({
                success: false,
                message: "No volunteer found"
            });
        }
        const resetToken = await volunteer.generateResetPasswordToken();
        const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
        return await sendPasswordReset(resetPasswordUrl, email, res);
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const verifyPasswordReset = async (req, res) => { 
    try {
        const { token } = req.params;
        const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: "Provide all required fields" 
            });
        }

        const volunteer = await Volunteer.findOne({ email });
        if(!volunteer) {
            return res.status(400).json({ 
                success: false, 
                message: "No volunteer found" 
            });
        }

        if(resetPasswordToken !== volunteer.resetPasswordToken) {
            return res.status(400).json({ 
                success: false, 
                message: "Incorrect reset password token" 
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"Passwords do not match"
            });
        }

        if(password.length<8 || password.length>16){
            return res.status(400).json({
                success:false,
                message:"Password must be between 8 and 16 characters"
            });
        }

        const currentTime = Date.now();
        const resetPasswordTokenExpireTime = new Date(volunteer.resetPasswordTokenExpire);

        if(currentTime > resetPasswordTokenExpireTime) {
            return res.status(400).json({ 
                success: false, 
                message: "Reset password token expired" 
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        volunteer.password = hashedPassword;
        volunteer.resetPasswordToken = null;
        volunteer.resetPasswordTokenExpire = null;
        await volunteer.save();

        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        });
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true });
        return res.status(200).json({ 
            success: true, 
            message: "Logged out successfully"
        });
        } catch (error) {
            console.log("Something went wrong", error.stack);
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            });
        }
};
