const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  empName:        { type: String, required: true },
  cellNo:         { type: String, required: true },
  employeeEmail:  { type: String, required: true },
  pickupAddress:  { type: String, required: true },
  pickupDateTime: { type: String, required: true },
  dropAddress:    { type: String, required: true },
  dropDate:       { type: String, required: true },
  carType:        { type: String, required: true },
  remarks:        { type: String, default: '' },
  createdAt:      { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);