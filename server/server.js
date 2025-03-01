require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Route dosyalarını içe aktar
const authRoutes = require("./routes/authRoutes");
const basketRoutes = require("./routes/basketRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB bağlantısı
mongoose.connect(
  "mongodb+srv://fatihinan3437:SFPdqeS27kUsEOtc@inan.9useu.mongodb.net/?retryWrites=true&w=majority&appName=inan"
);

// Ana rota
app.get("/", (req, res) => {
  res.send("API Çalışıyor! 🚀");
});

// Route'ları kullan
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/api/basket", basketRoutes);

// Server başlat
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});