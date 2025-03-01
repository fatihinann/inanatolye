const express = require("express");
const router = express.Router();
const ProductModel = require("../models/product");

// Tüm ürünleri getir
router.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});
router.get("/products/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    res.json(product);
  } catch (err) {
    console.error("Ürün getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
});
module.exports = router;
