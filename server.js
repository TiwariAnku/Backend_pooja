import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

import { sendBookingEmails } from './mailer.js'; 
import { log } from 'console';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const PORT = process.env.PORT || 5000; // Shifted to 5000 to match standard MERN routing

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  family: 4
})
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => {
    console.error('❌ MongoDB connection error - FULL DETAILS:');
    console.error(err);
  });

// Database Schema & Model
const bookingSchema = new mongoose.Schema({
  empName: { type: String, required: true },
  cellNo: { type: String, required: true },
  employeeEmail: { type: String, required: true },
  pickupAddress: { type: String, required: true },
  pickupDateTime: { type: String, required: true },
  dropAddress: { type: String, required: true },
  dropDateTime: { type: String, required: true },
  carType: { type: String, required: true },
  remarks: { type: String, default: 'None' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// API Endpoint matching frontend form fields
app.post('/api/booking', async (req, res) => {
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
      remarks 
    } = req.body;

    // 1. Save reference entry directly to MongoDB
    const newBooking = new Booking({
      empName,
      cellNo,
      employeeEmail,
      pickupAddress,
      pickupDateTime,
      dropAddress,
      dropDateTime,
      carType,
      remarks: remarks || 'None'
    });
    
    await newBooking.save();

    // 2. Trigger the premium dual email dispatcher logic
    await sendBookingEmails({
      empName,
      cellNo,
      employeeEmail,
      pickupAddress,
      pickupDateTime,
      dropAddress,
      dropDateTime,
      carType,
      remarks: remarks || 'None'
    });

    // Send successful response so frontend can proceed to redirect user to WhatsApp instantly
    res.status(200).json({ success: true, message: 'Booking processed successfully!' });
  } catch (error) {
    console.error('Backend endpoint processing failure:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});