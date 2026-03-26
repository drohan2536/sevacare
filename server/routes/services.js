const express = require('express');
const router = express.Router();

// In-memory bookings store
let bookings = [
  {
    _id: 'booking1',
    userId: 'user1',
    serviceType: 'massage',
    subType: 'Full Body Relaxation',
    date: new Date(Date.now() + 86400000).toISOString(),
    timeSlot: '10:00 AM - 11:00 AM',
    status: 'confirmed',
    provider: { name: 'Sunita Devi', phone: '9800000001', rating: 4.8, specialization: 'Physiotherapy' },
    notes: 'Gentle pressure preferred',
    address: '42 MG Road, Pune',
    amount: 800
  },
  {
    _id: 'booking2',
    userId: 'user1', 
    serviceType: 'cleaning',
    subType: 'Regular Cleaning',
    date: new Date(Date.now() + 172800000).toISOString(),
    timeSlot: '9:00 AM - 11:00 AM',
    status: 'pending',
    provider: { name: 'CleanPro Services', phone: '9800000002', rating: 4.5, specialization: 'Home Cleaning' },
    address: '42 MG Road, Pune',
    amount: 500
  }
];

// Service providers
const providers = {
  massage: [
    { id: 'p1', name: 'Sunita Devi', rating: 4.8, specialization: 'Physiotherapy', experience: '12 years', price: 800, image: '💆' },
    { id: 'p2', name: 'Rajesh Sharma', rating: 4.6, specialization: 'Ayurvedic Massage', experience: '8 years', price: 700, image: '💆‍♂️' },
    { id: 'p3', name: 'Meera Patel', rating: 4.9, specialization: 'Pain Relief', experience: '15 years', price: 1000, image: '🧴' },
  ],
  cleaning: [
    { id: 'c1', name: 'CleanPro Services', rating: 4.5, specialization: 'Home Cleaning', experience: '5 years', price: 500, image: '🧹' },
    { id: 'c2', name: 'SparkleHome', rating: 4.7, specialization: 'Deep Cleaning', experience: '8 years', price: 1200, image: '✨' },
    { id: 'c3', name: 'FreshSpace', rating: 4.4, specialization: 'Regular Cleaning', experience: '3 years', price: 400, image: '🏠' },
  ],
  doctor: [
    { id: 'd1', name: 'Dr. Anita Deshmukh', rating: 4.9, specialization: 'General Physician', experience: '20 years', price: 500, image: '👩‍⚕️' },
    { id: 'd2', name: 'Dr. Vikram Singh', rating: 4.7, specialization: 'Cardiologist', experience: '15 years', price: 800, image: '👨‍⚕️' },
    { id: 'd3', name: 'Dr. Priya Nair', rating: 4.8, specialization: 'Orthopedic', experience: '12 years', price: 700, image: '🩺' },
  ]
};

const timeSlots = [
  '8:00 AM - 9:00 AM',
  '9:00 AM - 10:00 AM', 
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM'
];

// Get providers for a service type
router.get('/providers/:type', (req, res) => {
  const { type } = req.params;
  if (!providers[type]) {
    return res.status(400).json({ error: 'Invalid service type' });
  }
  res.json(providers[type]);
});

// Get available time slots
router.get('/timeslots', (req, res) => {
  res.json(timeSlots);
});

// Create a booking
router.post('/', (req, res) => {
  const { serviceType, subType, date, timeSlot, providerId, notes, address } = req.body;
  
  if (!serviceType || !date || !timeSlot) {
    return res.status(400).json({ error: 'Service type, date, and time slot are required' });
  }

  const provider = providers[serviceType]?.find(p => p.id === providerId);
  
  const booking = {
    _id: 'booking_' + Date.now(),
    userId: req.headers['x-user-id'] || 'user1',
    serviceType,
    subType: subType || '',
    date,
    timeSlot,
    status: 'confirmed',
    provider: provider ? { name: provider.name, phone: '9800000000', rating: provider.rating, specialization: provider.specialization } : null,
    notes: notes || '',
    address: address || '',
    amount: provider?.price || 0,
    createdAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  res.status(201).json({ success: true, booking });
});

// Get user bookings
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'user1';
  const userBookings = bookings.filter(b => b.userId === userId);
  res.json(userBookings);
});

// Get all bookings (admin)
router.get('/all', (req, res) => {
  res.json(bookings);
});

// Update booking status
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const bookingIndex = bookings.findIndex(b => b._id === id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  bookings[bookingIndex] = { ...bookings[bookingIndex], status, updatedAt: new Date().toISOString() };
  res.json({ success: true, booking: bookings[bookingIndex] });
});

// Cancel booking
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const bookingIndex = bookings.findIndex(b => b._id === id);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  bookings[bookingIndex].status = 'cancelled';
  res.json({ success: true, message: 'Booking cancelled' });
});

module.exports = router;
