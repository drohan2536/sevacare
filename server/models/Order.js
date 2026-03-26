const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderType: { type: String, enum: ['food', 'medicine', 'grocery'], required: true },
  items: [{
    name: String,
    quantity: Number,
    price: Number,
    description: String
  }],
  prescriptionImage: String,
  dietPlan: String,
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'placed' 
  },
  deliveryAddress: String,
  estimatedDelivery: String,
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    message: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
