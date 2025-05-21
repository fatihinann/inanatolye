const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require("../controllers/cartController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Her rota için ayrı ayrı middleware uygulama
router.get("/", authenticateToken, getCart);
router.post("/items", authenticateToken, addToCart);
router.put("/items", authenticateToken, updateCartItem);
router.delete("/items/:productId", authenticateToken, removeFromCart);
router.delete("/", authenticateToken, clearCart);
router.post("/sync", authenticateToken, syncCart);

module.exports = router;