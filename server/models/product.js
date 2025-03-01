const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: {
    rate: Number,
    count: Number
  },
  features: {
    width: String,
    height: String,
    depth: String,
    color: String,
    woodType: String
  },
  stock: Number,
  maxQuantity: Number,
  reviews: Array
});

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = ProductModel;