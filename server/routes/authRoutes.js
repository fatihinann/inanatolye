const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");


router.get("/validate-token", authenticateToken, async (req, res) => {
  try {
    // If auth middleware passes, token is valid, send user data
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
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
