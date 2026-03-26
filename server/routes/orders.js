const express = require('express');
const router = express.Router();

// In-memory orders store
let orders = [
  {
    _id: 'order1',
    userId: 'user1',
    orderType: 'food',
    items: [
      { name: 'Diabetic-Friendly Breakfast', quantity: 1, price: 180, description: 'Oats porridge, boiled eggs, green tea' },
      { name: 'Low Sodium Lunch', quantity: 1, price: 250, description: 'Brown rice, dal, steamed veggies, buttermilk' }
    ],
    totalAmount: 430,
    status: 'delivered',
    deliveryAddress: '42 MG Road, Pune',
    estimatedDelivery: '30 mins',
    trackingUpdates: [
      { status: 'placed', timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Order placed' },
      { status: 'confirmed', timestamp: new Date(Date.now() - 3000000).toISOString(), message: 'Order confirmed by kitchen' },
      { status: 'preparing', timestamp: new Date(Date.now() - 2400000).toISOString(), message: 'Preparing your meal' },
      { status: 'delivered', timestamp: new Date(Date.now() - 1800000).toISOString(), message: 'Delivered successfully' }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Menu items
const menus = {
  food: {
    categories: [
      {
        name: 'Diabetic-Friendly',
        emoji: '🥗',
        items: [
          { id: 'f1', name: 'Diabetic Breakfast Bowl', price: 180, description: 'Oats porridge, boiled eggs, green tea', calories: 320, image: '🥣' },
          { id: 'f2', name: 'Sugar-Free Lunch Thali', price: 250, description: 'Brown rice, dal, steamed veggies, buttermilk', calories: 450, image: '🍱' },
          { id: 'f3', name: 'Low-GI Dinner', price: 220, description: 'Multigrain roti, paneer, salad', calories: 380, image: '🥘' },
        ]
      },
      {
        name: 'Heart-Healthy',
        emoji: '❤️',
        items: [
          { id: 'f4', name: 'Low Sodium Breakfast', price: 160, description: 'Poha, fruit bowl, herbal tea', calories: 280, image: '🫖' },
          { id: 'f5', name: 'Cardiac Care Lunch', price: 280, description: 'Quinoa, grilled fish, olive salad', calories: 420, image: '🐟' },
          { id: 'f6', name: 'Light Dinner', price: 200, description: 'Soup, whole wheat bread, steamed veggies', calories: 300, image: '🍲' },
        ]
      },
      {
        name: 'High-Protein',
        emoji: '💪',
        items: [
          { id: 'f7', name: 'Protein Breakfast', price: 200, description: 'Egg whites, sprouts, milk', calories: 350, image: '🥛' },
          { id: 'f8', name: 'Power Lunch', price: 300, description: 'Chicken breast, dal, brown rice', calories: 520, image: '🍗' },
          { id: 'f9', name: 'Recovery Dinner', price: 240, description: 'Paneer tikka, lentil soup, millet roti', calories: 440, image: '🧆' },
        ]
      }
    ]
  },
  medicine: {
    categories: [
      {
        name: 'Common Medicines',
        emoji: '💊',
        items: [
          { id: 'm1', name: 'Paracetamol 500mg', price: 30, description: 'Strip of 10 tablets', image: '💊' },
          { id: 'm2', name: 'Crocin Advance', price: 45, description: 'Strip of 15 tablets', image: '💊' },
          { id: 'm3', name: 'Vitamin D3 Supplements', price: 250, description: 'Bottle of 60 capsules', image: '🧴' },
        ]
      },
      {
        name: 'Diabetes Care',
        emoji: '🩸',
        items: [
          { id: 'm4', name: 'Metformin 500mg', price: 65, description: 'Strip of 10 tablets', image: '💊' },
          { id: 'm5', name: 'Glucometer Strips', price: 800, description: 'Pack of 50 strips', image: '📦' },
          { id: 'm6', name: 'Insulin Syringes', price: 120, description: 'Pack of 10', image: '💉' },
        ]
      },
      {
        name: 'BP & Heart',
        emoji: '❤️‍🩹',
        items: [
          { id: 'm7', name: 'Amlodipine 5mg', price: 55, description: 'Strip of 10 tablets', image: '💊' },
          { id: 'm8', name: 'Aspirin 75mg', price: 35, description: 'Strip of 14 tablets', image: '💊' },
          { id: 'm9', name: 'BP Monitor', price: 1500, description: 'Digital automatic monitor', image: '🩺' },
        ]
      }
    ]
  }
};

// Get menu
router.get('/menu/:type', (req, res) => {
  const { type } = req.params;
  if (!menus[type]) {
    return res.status(400).json({ error: 'Invalid order type. Use "food" or "medicine".' });
  }
  res.json(menus[type]);
});

// Create order
router.post('/', (req, res) => {
  const { orderType, items, deliveryAddress, prescriptionImage, dietPlan } = req.body;
  
  if (!orderType || !items || items.length === 0) {
    return res.status(400).json({ error: 'Order type and items are required' });
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  const order = {
    _id: 'order_' + Date.now(),
    userId: req.headers['x-user-id'] || 'user1',
    orderType,
    items,
    prescriptionImage: prescriptionImage || null,
    dietPlan: dietPlan || null,
    totalAmount,
    status: 'placed',
    deliveryAddress: deliveryAddress || '42 MG Road, Pune',
    estimatedDelivery: orderType === 'food' ? '30-45 mins' : '1-2 hours',
    trackingUpdates: [
      { status: 'placed', timestamp: new Date().toISOString(), message: 'Order placed successfully' }
    ],
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);

  // Simulate order progression
  setTimeout(() => {
    const idx = orders.findIndex(o => o._id === order._id);
    if (idx !== -1) {
      orders[idx].status = 'confirmed';
      orders[idx].trackingUpdates.push({
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        message: orderType === 'food' ? 'Kitchen has confirmed your order' : 'Pharmacy has confirmed your order'
      });
    }
  }, 5000);

  res.status(201).json({ success: true, order });
});

// Get user orders
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'user1';
  const userOrders = orders.filter(o => o.userId === userId);
  res.json(userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Get all orders (admin)
router.get('/all', (req, res) => {
  res.json(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Get order by ID
router.get('/:id', (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Update order status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, message } = req.body;
  const orderIndex = orders.findIndex(o => o._id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].trackingUpdates.push({
    status,
    timestamp: new Date().toISOString(),
    message: message || `Order ${status}`
  });
  
  res.json({ success: true, order: orders[orderIndex] });
});

module.exports = router;
