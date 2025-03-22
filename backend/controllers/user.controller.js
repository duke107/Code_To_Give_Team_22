import { log } from "console";
import { User } from "../models/user.model.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import bcrypt from "bcryptjs"
import crypto from "crypto"
export const register = async (req, res) => {
    try {
        // Destructure location along with other fields
        const { name, email, password, location } = req.body;
        
        // Validate all required fields including location
        if (!name || !email || !password || !location) {
            return res.status(400).json({ msg: "Please fill in all fields, including location" });
        }
        
        const isAlreadyPresent = await User.findOne({ email, accountVerified: true });
        if (isAlreadyPresent) {
            return res.status(400).json({ msg: "Email is already registered" });
        }
        
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ msg: "Password must be between 8 and 16 characters" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        // Include location when creating the new user
        const user = await User.create({ name, email, password: hashedPassword, location });
        
        const verificationCode = await user.generateVerificationCode();
        await user.save();
        
        sendVerificationCode(verificationCode, email, res);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}


export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }
        const userAllEntries = await User.find({
            email,
            accountVerified: false,
        }).sort({ createdAt: -1 });
        console.log(userAllEntries);
        

        if (!userAllEntries) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }
       const user=userAllEntries[0];
       console.log(user);
       
        
        console.log(user.verificationCode);
        console.log("Here");
        

        if(user.verificationCode !== Number(otp)){
            return res.status(400).json({ msg: "Invalid OTP" });
        }
        const currentTime=Date.now();

        const verificationCodeExpire= new Date(
            user.verificationCodeExpire
        ).getTime();

        if(currentTime>verificationCodeExpire){
            return res.status(400).json({ msg: "OTP has expired" });
        }
        
        
        user.accountVerified=true;
        user.verificationCode=null;
        user.verificationCodeExpire=null;
        await user.save({validateModifiedOnly: true});

        sendToken(user,200,"Account Verified",res)
    } catch (error) {
        console.log(error.message);
        
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    try {

    const {email,password} =req.body;
    if(!email || !password){
      return res.status(400).json({ msg: "Please fill in all fields" });
        }
        console.log(email)
    const user = await User.findOne({ email, accountVerified: true }).select("+password");
    console.log(user)
    if (!user) {

        return res.status(400).json({ msg: "User not found" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {

        return res.status(400).json({ msg: "Invalid password" });

    }

    sendToken(user, 200, "User logged in successfully", res);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


export const logout =async(req,res)=>{
    try {
        
        res.clearCookie('token', { httpOnly: true });
        return res.status(200).json({ success: true, message: "Logged out successfully"})
        } catch (error) {
            console.log(error.message);
            return res.status(500).json({ success: false, message: "Internal Server Error"
             })
        }
}

export const getUser = async (req, res) => {
    try {
       const user = req.user;
       return res.status(200).json({ success: true, user });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });

        
    }
}

export const forgotPassword= async(req,res)=>{
    const user = await User.findOne({
        email: req.body.email,
        accountVerified: true,
    });
    
    if (!user) {
        return res.status(400).json({success:false,message:"Invalid email"})
    }
    
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });
    
    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    
    const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);

    
    try {
        await sendEmail({
            email: user.email,
            subject: "Samartharam Password Recovery",
            message,
        });
        
    
        return res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully.`,
        });
    } catch (error) {
        console.log(error.message);
        
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
    }
}


export const resetPassword=async(req,res)=>{
    const {token}=req.params;
    const resetPasswordToken= crypto.createHash("sha256").update(token).digest("hex");
    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpires:{$gt: Date.now()},
    });
    if(!user){
        return res.status
    }

    if(req.body.password !==req.body.confirmPassword){
        return res.status(400).json({success:false,message:"Passwords do not match."})
    }
    if(req.body.password.length<8 || req.body.password.length>16 ){
        return res.status(400).json({success:false,message:"Password must be between 8 and 16 characters"})
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({success:true,message:"Password reset successfully."})


}

export const updateUser = async (req, res) => {
    try {
        console.log('====================================');
        console.log(req.body);
        console.log('====================================');
      const { user_id } = req.body;
      if (!user_id) {
        return res.status(400).json({ message: "No user_id provided" });
      }
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  

      if (typeof req.body.location !== "undefined") {
        user.location = req.body.location;
      }
  
      if (typeof req.body.weekdays !== "undefined") {
        user.availability.weekdays =
          req.body.weekdays === "true" || req.body.weekdays === true;
      }
      if (typeof req.body.weekends !== "undefined") {
        user.availability.weekends =
          req.body.weekends === "true" || req.body.weekends === true;
      }
  
      if (typeof req.body.avatarURL !== "undefined") {
        user.avatar = req.body.avatarURL;
      }
  
      await user.save();
  
      return res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };

  export const updatePassword = async (req, res) => {
    try {
      const { user_id, oldPassword, newPassword } = req.body;
  
      // Basic validation
      if (!user_id || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Check new password length
      if (newPassword.length < 8 || newPassword.length > 16) {
        return res
          .status(400)
          .json({ message: "Password must be between 8 and 16 characters." });
      }
  
      // Find user and include password field
      const user = await User.findById(user_id).select("+password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if oldPassword is correct
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }
  
      // Hash the new password
      const saltRounds = 10; // Adjust as needed
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
  
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  };

