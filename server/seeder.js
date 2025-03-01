const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ProductModel = require("./models/product");

dotenv.config(); // Eğer .env kullanıyorsan
const DB_URI = "mongodb+srv://fatihinan3437:SFPdqeS27kUsEOtc@inan.9useu.mongodb.net/?retryWrites=true&w=majority&appName=inan"; 

const data = {
  products: [
    {
      id: 1,
      title: "Wooden Mug",
      price: 50,
      description: "Handmade wooden mug.",
      category: "kitchen",
      image: "images/kupa.jpeg",
      rating: {
        rate: 0,
        count: 0,
      },
      features: {
        Width: "8 cm",
        Height: "10 cm",
        Color: "Natural Wood",
        "Wood Type": "Walnut",
      },
      stock: 10,
      maxQuantity: 3,
      reviews: [],
    },
    {
      id: 2,
      title: "Solid Wood Table",
      price: 3200,
      description: "Handmade solid wood table.",
      category: "home-decoration",
      image: "images/masif_masa.jpeg",
      rating: {
        rate: 0,
        count: 0,
      },
      features: {
        Width: "45 cm",
        Height: "90 cm",
        Depth: "60 cm",
        Color: "Brown",
        "Wood Type": "Birch",
      },
      stock: 5,
      maxQuantity: 2,
      reviews: [],
    },
  ],
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(DB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

    // Önce eski verileri temizleyelim
    await ProductModel.deleteMany();

    // Yeni verileri ekleyelim
    await ProductModel.insertMany(data.products);

    console.log("✅ Veriler başarıyla eklendi.");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Hata oluştu:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
