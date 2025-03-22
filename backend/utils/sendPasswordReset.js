import { generateForgotPasswordEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendPasswordReset(resetPasswordUrl, email, res) {
    try {
        const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);
        await sendEmail({
            email,
            subject: "Password Recovery (Samarthanam)",
            message
        });
        return res.status(200).json({
            success: true,
            message: "Password recovery details sent to your email"
        });
    } catch (error) {
        console.log("Something went wrong", error.stack);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
}