const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Route dosyalarını içe aktar
const authRoutes = require("./routes/authRoutes");
const basketRoutes = require("./routes/basketRoutes");
const productRoutes = require("./routes/productRoutes");

const helmet = require("helmet"); // Yüklemeniz gerekir: npm install helmet
const rateLimit = require("express-rate-limit"); // Yüklemeniz gerekir: npm install express-rate-limit
const mongoSanitize = require("express-mongo-sanitize"); // Yüklemeniz gerekir: npm install express-mongo-sanitize
const xss = require("xss-clean"); // Yüklemeniz gerekir: npm install xss-clean
const hpp = require("hpp"); // Yüklemeniz gerekir: npm install hpp
const dotenv = require("dotenv").config();
const app = express();

dotenv.config();

// CORS güvenliği - beyaz liste yaklaşımı
const whitelist = ["http://localhost:3000", "https://yourdomain.com"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Güvenlik headerları
app.use(helmet());

// Rate limiting - brute force saldırılarını önlemek için
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada max 100 istek
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/", limiter);

// Veri sanitizasyonu - NoSQL injection önleme
app.use(mongoSanitize());

// XSS saldırılarını önleme
app.use(xss());

// HTTP Parameter Pollution saldırılarını önleme
app.use(hpp());

// JSON veri boyutu limitini ayarlama
app.use(express.json({ limit: "10kb" }));

// Diğer Express middleware ve rotalarını buraya ekleyin...
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
