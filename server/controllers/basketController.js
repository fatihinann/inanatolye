// basketController.js
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

// Get the user's basket
const getBasket = asyncHandler(async (req, res) => {
  // Use req.user.id instead of req.params.userId if you're using the authenticated user's ID
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }
  
  res.json(user.basket);
});

// Add product to basket
const addToBasket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  const { productId, name, price, count, image } = req.body;

  if (!productId || !count || count <= 0) {
    res.status(400);
    throw new Error("Geçersiz ürün bilgisi");
  }

  const existingItem = user.basket.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.count += count;
  } else {
    user.basket.push({
      productId,
      name,
      price,
      count,
      image,
    });
  }

  await user.save();
  res.status(200).json(user.basket);
});

// Update basket quantity
const updateBasketQuantity = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  const { productId, count } = req.body;

  if (!productId || count === undefined || count < 0) {
    res.status(400);
    throw new Error("Geçersiz güncelleme bilgisi");
  }

  const basketItem = user.basket.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (!basketItem) {
    res.status(404);
    throw new Error("Ürün sepette bulunamadı");
  }

  // If count is 0, remove the item
  if (count === 0) {
    user.basket = user.basket.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
  } else {
    basketItem.count = count;
  }

  await user.save();
  res.status(200).json(user.basket);
});

// Remove product from basket
const removeFromBasket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  const productId = req.params.productId;

  user.basket = user.basket.filter(
    (item) => item.productId.toString() !== productId
  );

  await user.save();
  res.status(200).json(user.basket);
});

// Clear entire basket
const clearBasket = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  user.basket = [];
  await user.save();

  res.status(200).json({ message: "Sepet temizlendi", basket: [] });
});

// basketController.js - mergeGuestCart fonksiyonu
const mergeGuestCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id); // Token'dan gelen ID kullanılıyor
  if (!user) {
    res.status(404);
    throw new Error("Kullanıcı bulunamadı");
  }

  const guestItems = req.body.items || [];
  
  // İşlemler...
  
  await user.save();
  res.status(200).json(user.basket);
});

module.exports = {
  getBasket,
  addToBasket,
  updateBasketQuantity,
  removeFromBasket,
  clearBasket,
  mergeGuestCart,
};
