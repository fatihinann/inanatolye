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

    // Şifreyi hash'leme
    const salt = await bcrypt.genSalt(10);
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
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};

// Giriş işlemi
exports.login = async (req, res) => {
  try {
    // Email kontrolü
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifre kontrolü
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Şifre yanlış" });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Başarılı giriş
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(200).json({
      user: userResponse,
      token: token,
      message: "Giriş başarılı",
    });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası", error: err.message });
  }
};
