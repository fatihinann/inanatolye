const express = require("express");
const basketController = require("../controllers/basketController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, basketController.getBasket);
router.post("/merge", authenticateToken, basketController.mergeGuestCart);
router.post("/restore", authenticateToken, basketController.restoreSavedCart);
router.post("/", authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    req.body.products.forEach((newProduct) => {
      const existing = user.basket.find((p) =>
        p.productId.equals(newProduct.productId)
      );

      if (existing) {
        existing.count = Math.min(
          newProduct.count,
          getMaxQuantityFromDB(newProduct.productId)
        );
      } else {
        user.basket.push(validateProduct(newProduct));
      }
    });

    await user.save();
    res.json(user.basket);
  } catch (err) {
    handleError(res, err);
  }
});
router.delete(
  "/:productId",
  authenticateToken,
  basketController.removeFromBasket
);

module.exports = router;
