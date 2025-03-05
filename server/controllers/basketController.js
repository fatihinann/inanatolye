const UserModel = require("../models/user");

// Sepeti Getir
const getBasket = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("basket");
    res.json(user.basket);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Sepete Ürün Ekle
const addToBasket = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const existingItem = user.basket.find(
      (item) => item.productId.toString() === req.body.productId
    );

    if (existingItem) {
      existingItem.count += req.body.count;
    } else {
      user.basket.push(req.body);
    }

    await user.save();
    res.json(user.basket);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Sepetten Ürün Sil
const removeFromBasket = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    user.basket = user.basket.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await user.save();
    res.json(user.basket);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Misafir Sepetini Birleştir
const mergeGuestCart = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const guestItems = req.body.items || [];

    // Misafir sepetindeki her ürün için
    for (const guestItem of guestItems) {
      // Kullanıcı sepetinde aynı ürün var mı kontrol et
      const existingItem = user.basket.find(
        (item) => item.productId.toString() === guestItem.productId
      );

      if (existingItem) {
        // Ürün varsa miktarını artır
        existingItem.count += guestItem.count;
      } else {
        // Ürün yoksa ekle
        user.basket.push({
          productId: guestItem.productId,
          count: guestItem.count,
        });
      }
    }

    await user.save();
    res.json(user.basket);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Giriş yapıldığında kaydedilmiş sepeti geri yükle
const restoreSavedCart = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const savedCart = req.body.savedCart || [];

    if (savedCart.length > 0 && user.basket.length === 0) {
      // Kullanıcının sepeti boşsa, kaydedilmiş sepeti geri yükle
      user.basket = savedCart;
      await user.save();
    }

    res.json(user.basket);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};
module.exports = {
  getBasket,
  addToBasket,
  removeFromBasket,
  mergeGuestCart,
  restoreSavedCart,
};
