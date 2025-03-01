import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../redux/slices/userSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Kayıt işlemi
      const response = await axios.post("http://localhost:3001/auth/register", { 
        ...formData 
      });
      console.log("Kayıt başarılı:", response.data);
      
      // Redux state'ine kullanıcıyı ekle
      try {
        dispatch(registerUser(formData));
        setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
        // Giriş sayfasına yönlendir veya otomatik giriş yap
        navigate("/login");
      } catch (reduxError) {
        console.error("Redux kullanıcı kaydı hatası:", reduxError);
        setMessage(reduxError.message || "Kullanıcı kaydedildi ama sistem hatası oluştu.");
      }
    } catch (err) {
      console.error("API hatası:", err);
      if (err.response) {
        setMessage(err.response.data.message || "İşlem başarısız!");
      } else {
        setMessage("Sunucu bağlantı hatası!");
      }
    }
  };

  return (
    <div className="login-register-page">
      <h1>Kayıt Ol</h1>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Ad"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="surname"
          placeholder="Soyad"
          value={formData.surname}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Kayıt Ol</button>
      </form>
      <p>
        Zaten hesabınız var mı? 
        <button onClick={() => navigate("/login")}>
          Giriş Yap
        </button>
      </p>
    </div>
  );
};

export default Register;