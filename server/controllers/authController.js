//Auth Controller.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

// Kayıt işlemi
exports.register = async (req, res) => {
  try {
    // Email kontrolü - aynı email ile kayıt var mı?
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kullanılıyor" });
    }
    
    // Şifre karmaşıklığını kontrol et
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({ 
        message: "Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir." 
      });
    }

    // Şifreyi hash'leme - salt faktörü 12 olarak güncelledim (daha güvenli)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    // Yeni kullanıcı oluşturma
    const newUser = await UserModel.create({
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: hashedPassword, // Hash'lenmiş şifreyi kaydet
    });
    
    // Şifreyi response'dan çıkar
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, message: "Kayıt başarılı" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Giriş işlemi
exports.login = async (req, res) => {
  try {
    // Email kontrolü
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      // Güvenlik için aynı mesajı kullan (brute force saldırılarını zorlaştırmak için)
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }
    
    // Şifre kontrolü
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      // Güvenlik için aynı mesajı kullan
      return res.status(401).json({ message: "Geçersiz kimlik bilgileri" });
    }
    
    // JWT token oluştur - .env dosyasından JWT_SECRET kullan
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET, // ACCESS_TOKEN_SECRET yerine JWT_SECRET kullanıyoruz
      { expiresIn: "1h" }
    );
    
    // Başarılı giriş
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    // Refresh token ekleme seçeneği
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(200).json({
      user: userResponse,
      token: token,
      refreshToken: refreshToken, // Refresh token eklendi
      message: "Giriş başarılı",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Refresh token işlemi (opsiyonel)
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token gerekli" });
    }
    
    // Token'ı doğrula
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Geçersiz token" });
      }
      
      // Yeni access token oluştur
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      
      res.json({
        token: newAccessToken
      });
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};