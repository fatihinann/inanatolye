// controllers/cartController.js
const Cart = require("../models/cart");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");

// Get the current user's cart
const getCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id; // veya req.user._id - middleware'inizin nasıl user bilgisini eklediğine bağlı

    // userId alanıyla sepeti bul
    let cart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "name price image"
    );

    // Eğer sepet yoksa boş bir sepet döndür
    if (!cart) {
      return res.json({ items: [] });
    }

    // Sepeti gönder
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res
      .status(500)
      .json({ message: "Error retrieving cart", error: error.message });
  }
});

// Add item to cart
const addToCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: quantity || 1 }],
      });
    } else {
      // Check if item exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        // Item exists, update quantity
        cart.items[itemIndex].quantity += quantity || 1;
      } else {
        // Item doesn't exist, add new item
        cart.items.push({
          productId,
          quantity: quantity || 1,
        });
      }
    }

    // Save cart
    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Add to cart error:", error);
    res
      .status(500)
      .json({ message: "Error adding product to cart", error: error.message });
  }
});

// Update cart item quantity
const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    // Find cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // If quantity is 0, remove item
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Save cart
    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Update cart item error:", error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Find cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove item
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    // Save cart
    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res
      .status(500)
      .json({
        message: "Error removing product from cart",
        error: error.message,
      });
  }
});

// Clear cart
const clearCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Find and delete cart
    await Cart.findOneAndDelete({ userId });

    res.status(200).json({ message: "Cart cleared", items: [] });
  } catch (error) {
    console.error("Clear cart error:", error);
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
});

// Sync cart (merge guest cart with user cart)
const syncCart = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    // Clear existing cart first
    await Cart.findOneAndDelete({ userId });

    // Create new cart
    let cart = new Cart({
      userId,
      items: [],
    });

    // Process each item from the request
    for (const item of items) {
      if (!item.productId) continue;

      // Check if product exists
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // Add item with new quantity
      cart.items.push({
        productId: item.productId,
        quantity: item.quantity || 1,
      });
    }

    // Save new cart
    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price image"
    );

    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Sync cart error:", error);
    res
      .status(500)
      .json({ message: "Cart synchronization error", error: error.message });
  }
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
