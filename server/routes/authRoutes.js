const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/validate-token", authenticateToken, async (req, res) => {
  try {
    const userData = { ...req.user.toObject() };
    delete userData.password;
    
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});
// Kayıt rotası
router.post("/register", authController.register);

// Giriş rotası
router.post("/login", authController.login);

module.exports = router;
