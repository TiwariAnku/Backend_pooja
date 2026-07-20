import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

import { sendBookingEmails } from "./mailer.js";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://pooja-travels-eta.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Health Check
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    family: 4,
  })
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
  });

// Booking Schema
const bookingSchema = new mongoose.Schema({
  empName: { type: String, required: true },
  cellNo: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupDateTime: { type: String, required: true },
  dropAddress: { type: String, required: true },
  dropDateTime: { type: String, required: true },
  carType: { type: String, required: true },
  remarks: { type: String, default: "None" },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);

// Booking API
app.post("/api/booking", async (req, res) => {
  try {
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
    } = req.body;

    // Save booking first
    const newBooking = new Booking({
      empName,
      cellNo,
      employeeEmail,
      pickupAddress,
      pickupDateTime,
      dropAddress,
      dropDateTime,
      carType,
      remarks: remarks || "None",
    });

    await newBooking.save();
    console.log("✅ Booking saved successfully.");

    // Send Email (don't fail booking if email fails)
    try {
      await sendBookingEmails({
        empName,
        cellNo,
        employeeEmail,
        pickupAddress,
        pickupDateTime,
        dropAddress,
        dropDateTime,
        carType,
        remarks: remarks || "None",
      });

      console.log("✅ Emails sent successfully.");
    } catch (mailError) {
      console.error("❌ Email Sending Failed:");
      console.error(mailError);
    }

    res.status(200).json({
      success: true,
      message: "Booking saved successfully.",
    });
  } catch (error) {
    console.error("❌ Backend Error:");
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
