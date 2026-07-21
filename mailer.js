import dotenv from "dotenv";

dotenv.config();

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
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Employee Name</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${empName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Cell Number</td>
        <td style="padding: 10px; border: 1px solid #e2e8f0;">${cellNo}</td>
      </tr>
      <tr style="background-color: #f8fafc;">
        <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email Address</td>
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

  // Helper function to send email via Brevo REST API over HTTPS
  const sendEmailViaBrevo = async (toEmail, subject, htmlContent) => {
    // Basic validation guard
    if (!toEmail) {
      throw new Error("Recipient target email address is missing or undefined.");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Pooja Travels",
          email: process.env.EMAIL_USER, // Must match verified sender in Brevo
        },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  };

  try {
    // Send both emails simultaneously
    await Promise.all([
      // EMAIL A: Admin Notification
      sendEmailViaBrevo(
        process.env.ADMIN_EMAIL,
        `🚨 NEW CAB BOOKING REQUEST - ${empName} (${carType})`,
        `
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
            <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">New Booking Alert</h2>
            <p>Hello Admin, a new travel reservation form payload has been registered via your web portal. Details follow below:</p>
            ${tableContent}
            <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Pooja Travels CMS Engine System • Automated Notification Link</p>
          </div>
        `
      ),

      // EMAIL B: Customer Confirmation
      sendEmailViaBrevo(
        employeeEmail,
        `🚖 Cab Booking Acknowledgment - Pooja Travels`,
        `
          <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px;">
            <h2 style="color: #0f172a; border-bottom: 3px solid #f59e0b; padding-bottom: 10px;">Booking Order Received</h2>
            <p>Dear ${empName},</p>
            <p>Thank you for choosing <strong>Pooja Travels</strong>. We have successfully registered your request. Our dispatcher team will reach out with driver routing details shortly.</p>
            <h4 style="margin-top: 20px; color: #1e293b;">Your Booking Summary:</h4>
            ${tableContent}
            <br>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; font-size: 13px; color: #166534;">
              <strong>Note:</strong> Your companion text has also been sent to our dispatch team via WhatsApp for instant processing.
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px;">
            <p style="font-size: 11px; color: #64748b; text-align: center;">
              Office No. 194, Vishnu Nagar Society, L.U. Gadkari Marg, Chembur, Mumbai-400 074<br>
              Contact: 9594917750 / 9702909087 | GSTIN: 27AICPT7468H1ZP
            </p>
          </div>
        `
      ),
    ]);

    console.log("✉️ Both Admin and Customer emails sent successfully via Brevo!");
  } catch (error) {
    console.error("Error sending email in mailer.js:", error);
    throw error;
  }
};
