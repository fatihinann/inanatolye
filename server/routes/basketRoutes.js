// routes/basketRoutes.js
const express = require("express");
const router = express.Router();
const {
  getBasket,
  addToBasket,
  updateBasketQuantity,
  removeFromBasket,
  clearBasket,
  mergeGuestCart,
} = require("../controllers/basketController");
const { authenticateToken, admin } = require("../middlewares/authMiddleware");

// Get current user's basket
router.get("/", authenticateToken, getBasket);

// Sync basket (for user login)
router.post("/sync", authenticateToken, mergeGuestCart);

// Add product to basket
router.post("/add", authenticateToken, addToBasket);

// Update product quantity in basket
router.put("/update", authenticateToken, updateBasketQuantity);

// Remove product from basket
router.delete("/:productId", authenticateToken, removeFromBasket);

// Clear entire basket
router.delete("/", authenticateToken, clearBasket);

module.exports = router;