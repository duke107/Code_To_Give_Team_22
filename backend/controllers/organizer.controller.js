// import { Admin } from "../models/admin.model.js";
//!make admin.model.js first please!

import { Organizer } from "../models/organizer.model.js";
import { sendToken } from "../utils/sendToken.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { sendPasswordReset } from "../utils/sendPasswordReset.js";
import { sendOrganizerApprovalRequest } from "../utils/sendOrganizerApprovalRequest.js";
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
        const organizer = await Organizer.create({ 
            name, phone, email, password: hashedPassword, skills, location, availability
        });
        const verificationCode = await organizer.generateVerificationCode();
        return await sendVerificationCode(verificationCode, email, res);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Organizer already exists"
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
        const organizer = await Organizer.findOne({ email });

        if(!organizer) {
            return res.status(404).json({ 
                success: false, 
                message: "No organizer found"                 
            });
        }

        if(organizer.emailVerified) {
            return res.status(409).json({ 
                success: false, 
                message: "Email has already been verified"                 
            });
        }

        const verificationCode = await organizer.generateVerificationCode();
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

        const organizer = await Organizer.findOne({ email });

        if(!organizer) {
            return res.status(404).json({ 
                success: false, 
                message: "No organizer found" 
            });
        }

        if(organizer.emailVerified) {
            return res.status(409).json({ 
                success: false, 
                message: "Email has already been verified" 
            });
        }

        if(organizer.verificationCode !== Number(verificationCode)) {
            return res.status(401).json({ 
                success: false, 
                message: "Incorrect verification code" 
            });
        }

        const currentTime = Date.now();
        const verificationCodeExpireTime = new Date(organizer.verificationCodeExpire);

        if(currentTime > verificationCodeExpireTime) {
            return res.status(410).json({ 
                success: false, 
                message: "Verification code expired" 
            });
        }

        organizer.verificationCode = null;
        organizer.verificationCodeExpire = null;
        organizer.emailVerified = true;
        await organizer.save({ validateModifiedOnly: true });

        return res.status(200).json({ 
            success: true, 
            message: "Email successfully verified" 
        });
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
        const organizer = await Organizer.findOne({ email, emailVerified: true }).select("+password");

        if (!organizer) {
            return res.status(401).json({ 
                sucess: false, 
                message: "Incorrect email or password" 
            });
        }

        const isPasswordMatched = await bcrypt.compare(password, organizer.password);

        if (!isPasswordMatched) {
            return res.status(401).json({ 
                sucess: false, 
                message: "Incorrect email or password" 
            });
        }
        sendToken(organizer, 200, "Organizer logged in successfully", res);
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const getOrganizer = async (req, res) => {  
    try {
        const { id } = req;
        const organizer = await Organizer.findById(id);
        if (!organizer) {
            return res.status(404).json({ 
                success: false, 
                message: "Organizer not found" 
            });
        }
        return res.status(200).json({ organizer });
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
        const organizer = await Organizer.findOne({
            email,
            emailVerified: true,
        });
        
        if (!organizer) {
            return res.status(404).json({
                success: false,
                message: "No organizer found"
            });
        }
        const resetToken = await organizer.generateResetPasswordToken();
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

        const organizer = await Organizer.findOne({ email });
        if(!organizer) {
            return res.status(404).json({ 
                success: false, 
                message: "No organizer found" 
            });
        }

        if(resetPasswordToken !== organizer.resetPasswordToken) {
            return res.status(401).json({ 
                success: false, 
                message: "Incorrect reset password token" 
            });
        }

        const currentTime = Date.now();
        const resetPasswordTokenExpireTime = new Date(organizer.resetPasswordTokenExpire);

        if(currentTime > resetPasswordTokenExpireTime) {
            return res.status(410).json({ 
                success: false, 
                message: "Reset password token expired" 
            });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if(password.length < 8 || password.length > 16){
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 16 characters"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        organizer.password = hashedPassword;
        organizer.resetPasswordToken = null;
        organizer.resetPasswordTokenExpire = null;
        await organizer.save();

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


//!There was no admin.model.js please make that first
// export const sendApproveRequest = async (req, res) => {
//     try {
//         const { id } = req;
//         const organizer = await Organizer.findById(id);
//         if (!organizer) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Organizer not found" 
//             });
//         }

//         if (organizer.accountVerified) {
//             return res.status(409).json({ 
//                 success: false, 
//                 message: "Organizer has already been approved" 
//             });
//         }

//         const admin = Admin.findOne({ email: process.env.ADMIN_EMAIL });
//         if (!admin) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "Admin not found" 
//             });
//         }
//         admin.pendingApprovals.push(organizer);
//         await admin.save();
//         return await sendOrganizerApprovalRequest(
//             organizer.name,
//             organizer.email,
//             process.env.ADMIN_EMAIL,
//             res
//         );

//     } catch (error) {
//         console.log("Something went wrong", error.stack);
//         return res.status(500).json({
//             success: false,
//             message: "Something went wrong"
//         });
//     }
// };