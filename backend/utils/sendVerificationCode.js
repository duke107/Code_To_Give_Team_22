import { generateVerificationOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode,email,res){
    try {
        const message =generateVerificationOtpEmailTemplate(verificationCode);
        sendEmail({
            email,
            subject:"Verification Code(Samartharam)",
            message
        });
        return res.status(200).json({success:true,message:"Verification code sent to your email."});
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Verification code failed to send"
        })
    }
}