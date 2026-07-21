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

  const tableContent = `
    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; margin-top: 15px;">
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Employee/Customer Name</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${empName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Cell Number</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${cellNo}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email Address</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${employeeEmail}">${employeeEmail}</a></td>
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
    // 🚨 Only 1 Email is sent directly to Admin
    await resend.emails.send({
      from: "Pooja Travels <onboarding@resend.dev>",
      to: [process.env.ADMIN_EMAIL], // Admin receives this
      replyTo: employeeEmail, // Admin simple 'Reply' daba kar customer ko contact kar sakta hai
      subject: `🚨 NEW BOOKING REQUEST: ${empName} - ${carType}`,
      html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
          <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">New Booking Alert</h2>
          <p>Hello Admin, a customer has requested a car booking through the website. Here are the details:</p>
          ${tableContent}
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Pooja Travels Automated Booking System</p>
        </div>
      `,
    });

    console.log("✉️ Booking notification email successfully sent to Admin!");
  } catch (error) {
    console.error("Resend API error inside mailer.js:", error);
    throw error;
  }
};
