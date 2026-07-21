import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBookingEmails = async (bookingData) => {
  const {
    empName,
    cellNo,
    employeeEmail,
    pickupAddress,
    pickupDateTime,
    dropAddress,
    dropDateTime,
    carType,
    remarks,
  } = bookingData;

  // Set sender domain (use onboarding@resend.dev until you add a custom domain in Resend)
  const SENDER_EMAIL = process.env.SENDER_EMAIL || "Pooja Travels <onboarding@resend.dev>";
  
  // Resend restricts 'to' addresses to your account email when using onboarding@resend.dev
  const adminRecipient = process.env.ADMIN_EMAIL;
  
  // If you are using onboarding@resend.dev, route customer email to admin during testing
  const customerRecipient = SENDER_EMAIL.includes("onboarding@resend.dev") 
    ? process.env.ADMIN_EMAIL 
    : employeeEmail;

  const tableContent = `
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; margin-top: 15px;">
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Employee Name</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${empName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Cell Number</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${cellNo}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Customer Email</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${employeeEmail}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Car Requested</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; color: #d97706; font-weight: bold;">${carType}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Pickup Details</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${pickupAddress} <br><small style="color:#64748b;">(${pickupDateTime})</small></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Drop Details</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${dropAddress} <br><small style="color:#64748b;">(${dropDateTime})</small></td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Special Remarks</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-style: italic;">${remarks || "N/A"}</td>
      </tr>
    </table>
  `;

  try {
    // Dispatch both emails in parallel via Resend
    await Promise.all([
      // 1. Admin Email
      resend.emails.send({
        from: SENDER_EMAIL,
        to: [adminRecipient],
        subject: `🚨 NEW CAB BOOKING REQUEST - ${empName} (${carType})`,
        html: `
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
            <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">New Booking Alert</h2>
            <p>Hello Admin, a new booking request has been submitted. Details follow below:</p>
            ${tableContent}
          </div>
        `,
      }),

      // 2. Customer Confirmation Email
      resend.emails.send({
        from: SENDER_EMAIL,
        to: [customerRecipient],
        subject: `🚖 Cab Booking Acknowledgment - Pooja Travels`,
        html: `
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
            <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">Booking Order Received</h2>
            <p>Dear ${empName},</p>
            <p>Thank you for choosing <strong>Pooja Travels</strong>. We have registered your request and our dispatch team will reach out shortly.</p>
            ${tableContent}
          </div>
        `,
      }),
    ]);

    console.log("✉️ Both Admin and Customer emails successfully sent via Resend!");
  } catch (error) {
    console.error("❌ Resend API Error:", error);
    throw error;
  }
};
