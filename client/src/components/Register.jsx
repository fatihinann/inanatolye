import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../redux/slices/userSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Şifre alanı için canlı doğrulama
    if (name === "password") {
      validatePassword(value);
    }
  };

  // Şifre doğrulama fonksiyonu
  const validatePassword = (password) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) {
      setPasswordError("Şifre en az 8 karakter uzunluğunda olmalıdır.");
      return false;
    } else if (!hasLowerCase) {
      setPasswordError("Şifre en az bir küçük harf içermelidir.");
      return false;
    } else if (!hasUpperCase) {
      setPasswordError("Şifre en az bir büyük harf içermelidir.");
      return false;
    } else if (!hasNumber) {
      setPasswordError("Şifre en az bir rakam içermelidir.");
      return false;
    } else if (!hasSpecialChar) {
      setPasswordError("Şifre en az bir özel karakter (@$!%*?&) içermelidir.");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form gönderilmeden önce şifreyi doğrula
    if (!validatePassword(formData.password)) {
      setMessage({ 
        text: passwordError, 
        type: "error" 
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      // Kayıt işlemi
      const response = await axios.post("http://localhost:5000/auth/register", {
        ...formData
      });
      
      console.log("Kayıt başarılı:", response.data);
      
      // Redux state'ine kullanıcıyı ekle
      try {
        dispatch(registerUser(formData));
        setMessage({ 
          text: "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...", 
          type: "success" 
        });
        
        // Giriş sayfasına yönlendir
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (reduxError) {
        console.error("Redux kullanıcı kaydı hatası:", reduxError);
        setMessage({ 
          text: reduxError.message || "Kullanıcı kaydedildi ama sistem hatası oluştu.", 
          type: "error" 
        });
      }
    } catch (err) {
      console.error("API hatası:", err);
      if (err.response) {
        setMessage({ 
          text: err.response.data.message || "İşlem başarısız!", 
          type: "error" 
        });
      } else {
        setMessage({ 
          text: "Sunucu bağlantı hatası!", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-register-page">
      <h1>Kayıt Ol</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Ad"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
        
        <input
          type="text"
          name="surname"
          placeholder="Soyad"
          value={formData.surname}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
        
        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          disabled={isSubmitting}
          required
        />
        
        <div className="password-container">
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
          
          {passwordError && (
            <div className="password-error">
              {passwordError}
            </div>
          )}
          
          <div className="password-info">
            Şifre en az 8 karakter, bir büyük harf, bir küçük harf, 
            bir rakam ve bir özel karakter (@$!%*?&) içermelidir.
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || passwordError !== ""}
        >
          {isSubmitting ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
      </form>
      
      <p>
        Zaten hesabınız var mı?
        <button 
          onClick={() => navigate("/login")} 
          disabled={isSubmitting}
        >
          Giriş Yap
        </button>
      </p>
    </div>
  );
};

export default Register;