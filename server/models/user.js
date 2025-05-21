const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  phone: String,
  birthDate: String,
  gender: String,
  address: {
    title: String,
    sehir: String,
    ilce: String,
    mahalle: String,
    adres: String,
    postalCode: String,
  },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;