// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  syncCart 
} = require('../controllers/cartController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes use the authentication middleware
router.use(authenticateToken);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/items', addToCart);

// Update item quantity
router.put('/items', updateCartItem);

// Remove item from cart
router.delete('/items/:productId', removeFromCart);

// Clear cart
router.delete('/', clearCart);

// Sync cart (for merging guest cart with user cart)
router.post('/sync', syncCart);

module.exports = router;