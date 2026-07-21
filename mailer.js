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

  // The email address you signed up with on Resend (e.g. your personal/admin email)
  const MY_VERIFIED_RESEND_EMAIL = process.env.ADMIN_EMAIL;

  try {
    // 1. Send Admin Email
    await resend.emails.send({
      from: "Pooja Travels <onboarding@resend.dev>",
      to: [MY_VERIFIED_RESEND_EMAIL], // Must be your registered Resend email in testing mode
      subject: `🚨 NEW CAB BOOKING REQUEST - ${empName} (${carType})`,
      html: `
        <h2>New Booking Request</h2>
        <p><strong>Customer Name:</strong> ${empName}</p>
        <p><strong>Phone:</strong> ${cellNo}</p>
        <p><strong>Email:</strong> ${employeeEmail}</p>
        <p><strong>Vehicle:</strong> ${carType}</p>
        <p><strong>Pickup:</strong> ${pickupAddress} (${pickupDateTime})</p>
        <p><strong>Drop:</strong> ${dropAddress} (${dropDateTime})</p>
        <p><strong>Remarks:</strong> ${remarks || "N/A"}</p>
      `,
    });

    // 2. Send Customer Confirmation Email
    // NOTE: In Resend Testing Mode, 'to' must be your verified account email unless you verify a domain.
    const recipient = process.env.NODE_ENV === "production" ? employeeEmail : MY_VERIFIED_RESEND_EMAIL;

    await resend.emails.send({
      from: "Pooja Travels <onboarding@resend.dev>",
      to: [recipient],
      subject: `🚖 Cab Booking Acknowledgment - Pooja Travels`,
      html: `
        <h2>Booking Order Received</h2>
        <p>Dear ${empName},</p>
        <p>Thank you for choosing <strong>Pooja Travels</strong>. We have successfully registered your cab request for ${carType}.</p>
      `,
    });

    console.log("✉️ Both Admin and Customer emails dispatched successfully!");
  } catch (error) {
    console.error("❌ Resend error:", error);
    throw error;
  }
};
