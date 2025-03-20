import { User } from "../models/user.model.js";
import { sendToken } from "../utils/sendToken.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import bcrypt from "bcryptjs"

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "Please fill in all fields" });
        }
        const isAlreadyPresent = await User.findOne({ email, accountVerified: true });
        if (isAlreadyPresent) {
            return res.status(400).json({ msg: "Email is already registered" });
        }
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({ msg: "Password must be between 8 and 16 characters" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword });
        const verificationCode = await user.generateVerificationCode();
        await user.save();
        sendVerificationCode(verificationCode, email, res);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
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