import { generateOrganizerApprovalEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendOrganizerApprovalRequest(organizerName, organizerEmail, email, res) {
    try {
        const message = generateOrganizerApprovalEmailTemplate(organizerName, organizerEmail);
        await sendEmail({
            email,
            subject: "Organizer Approval Request (Samarthanam)",
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