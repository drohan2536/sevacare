const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { 
    type: String, 
    enum: ['massage', 'cleaning', 'doctor'], 
    required: true 
  },
  subType: String, // e.g., 'deep_cleaning', 'regular_cleaning', 'physiotherapy'
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  provider: {
    name: String,
    phone: String,
    rating: Number,
    specialization: String
  },
  notes: String,
  address: String,
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
