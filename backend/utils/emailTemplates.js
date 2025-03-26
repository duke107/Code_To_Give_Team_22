export function generateVerificationOtpEmailTemplate(otpCode){
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">

    <h2 style="color: #fff; text-align: center;">Verify Your Email Address</h2>

    <p style="font-size: 16px; color: #ccc;">Dear User,</p>

    <p style="font-size: 16px; color: #ccc;">To complete your registration or login, please use the following verification code:</p>

    <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #000; padding: 10px 20px; border: 1px solid #fff; border-radius: 5px; background-color: #fff;">
            ${otpCode}
        </span>
    </div>

    <p style="font-size: 16px; color: #ccc;">This code is valid for 15 minutes. Please do not share this code with anyone.</p>

    <p style="font-size: 16px; color: #ccc;">If you did not request this email, please ignore it.</p>

    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you,<br>Bookblors Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
    </footer>

</div>`
}


export function generateForgotPasswordEmailTemplate(resetPasswordUrl){
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
    <h2 style="color: #fff; text-align: center;">Reset Your Password</h2>
    <p style="font-size: 16px; color: #ccc;">Dear User,</p>
    <p style="font-size: 16px; color: #ccc;">You requested to reset your password. Please click the button below to proceed:</p>
    <div style="text-align: center; margin: 20px 0;">
        <a href="${resetPasswordUrl}" style="display: inline-block; font-size: 16px; font-weight: bold; color: #000; text-decoration: none; padding: 12px 20px; border: 1px solid #fff; border-radius: 5px; background-color: #fff;">
            Reset Password
        </a>
    </div>
    <p style="font-size: 16px; color: #ccc;">If you did not request this, please ignore this email. The link will expire in 10 minutes.</p>
    <p style="font-size: 16px; color: #ccc;">If the button above doesn't work, copy and paste the following URL into your browser:</p>
    <p style="font-size: 16px; color: #fff; word-wrap: break-word;">${resetPasswordUrl}</p>
    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you,<br>Bookworm Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
    </footer>
</div>`
}

export function generateOrganizerApprovalEmailTemplate(organizerName, organizerEmail) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">

    <h2 style="color: #fff; text-align: center;">Organizer Approval Request</h2>

    <p style="font-size: 16px; color: #ccc;">Dear Admin,</p>

    <p style="font-size: 16px; color: #ccc;">A new organizer has requested approval to join the platform. Below are the details:</p>

    <div style="margin: 20px 0; padding: 15px; border: 1px solid #fff; border-radius: 5px; background-color: #111;">
        <p style="font-size: 16px; color: #fff;"><strong>Name:</strong> ${organizerName}</p>
        <p style="font-size: 16px; color: #fff;"><strong>Email:</strong> ${organizerEmail}</p>
    </div>

    <p style="font-size: 16px; color: #ccc;">Please review and take the necessary action.</p>

    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you,<br>Bookblors Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
    </footer>

</div>`
}


export function generateTaskAssignmentEmailTemplate(eventTitle, tasks) {
    const taskList = tasks.map(task => `<li>${task}</li>`).join("");

    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">

    <h2 style="color: #fff; text-align: center;">New Task Assignment</h2>

    <p style="font-size: 16px; color: #ccc;">Dear Volunteer,</p>

    <p style="font-size: 16px; color: #ccc;">You have been assigned new tasks for the event: <strong>${eventTitle}</strong>.</p>

    <p style="font-size: 16px; color: #ccc;">Here are your assigned tasks:</p>

    <ul style="margin: 15px 0; padding-left: 20px; color: #fff;">
        ${taskList}
    </ul>

    <p style="font-size: 16px; color: #ccc;">Please complete these tasks at your earliest convenience.</p>

    <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>Thank you,<br>Samarthanam Team</p>
        <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
    </footer>

</div>`;
}

export function generateUserRegistrationEmailTemplate(volunteerName, eventTitle) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">New Volunteer Registration</h2>
        <p style="font-size: 16px; color: #555;">Hello,</p>

        <p style="font-size: 16px; color: #555;">
            A new volunteer has registered for your event <strong>${eventTitle}</strong>.
        </p>

        <div style="margin: 20px 0; padding: 10px; background-color: #fff; border-left: 4px solid #007bff;">
            <p style="font-size: 16px; color: #333;"><strong>Volunteer Name:</strong> ${volunteerName}</p>
        </div>

        <p style="font-size: 16px; color: #555;">You can check your event dashboard for more details.</p>

        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #888;">
            <p>Thank you,<br>Samartharam Team</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply.</p>
        </footer>
    </div>
    `;
}


export function generateEventCompletionEmailTemplate(eventTitle) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
  
      <h2 style="color: #fff; text-align: center;">Thank You for Your Support!</h2>
  
      <p style="font-size: 16px; color: #ccc;">Dear Volunteer,</p>
  
      <p style="font-size: 16px; color: #ccc;">The event <strong>${eventTitle}</strong> has successfully concluded, and we sincerely appreciate your contribution.</p>
  
      <p style="font-size: 16px; color: #ccc;">We hereby invite you to fill the event feedback form with your honest thoughts. Thank you!</p>
  
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>Thank you,<br>Samarthanam Team</p>
          <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
      </footer>
  
  </div>`;
  }
  

  export function generateReplyEmailTemplate(userName, replyText) {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
  
      <h2 style="color: #fff; text-align: center;">Response to Your Inquiry</h2>
  
      <p style="font-size: 16px; color: #ccc;">Dear ${userName},</p>
  
      <p style="font-size: 16px; color: #ccc;">Thank you for reaching out to us. Below is our response to your query:</p>
  
      <blockquote style="font-size: 16px; color: #fff; padding: 10px; border-left: 4px solid #ccc; background: #222;">
        ${replyText}
      </blockquote>
  
      <p style="font-size: 16px; color: #ccc;">If you have any further questions, feel free to contact us again.</p>
  
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
          <p>Best regards,<br>Samarthanam Team</p>
          <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
      </footer>
  
    </div>`;
  }
  


export const generateCompletedDonationTemplate = (donorName, amount, ) => {
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #000; color: #fff;">
        <h2 style="color: #fff; text-align: center;">Thank You for Your Support!</h2>
        <p style="font-size: 16px; color: #ccc;">Dear ${donorName},</p>
        <p style="font-size: 16px; color: #ccc;">We sincerely appreciate your generous donation of <strong>₹${amount}</strong>.</p>
        <p style="font-size: 16px; color: #ccc;">Your support helps us continue our mission to make a difference. Thank you!</p>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
            <p>Thank you,<br>Samarthanam Team</p>
            <p style="font-size: 12px; color: #444;">This is an automated message. Please do not reply to this email.</p>
        </footer>
    </div>`;
};