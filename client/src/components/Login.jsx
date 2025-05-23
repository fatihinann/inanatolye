import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithBasketSync } from "../redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  
  // Get authentication status and error from Redux
  const isAuthenticated = useSelector(state => state.users.isAuthenticated);
  const errorMessage = useSelector(state => state.users.error);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      if (isLogin) {
        // Login with API and sync basket
        await dispatch(loginWithBasketSync({ 
          email: formData.email, 
          password: formData.password 
        }));
        // Navigation will happen in useEffect after authentication state updates
      } else {
        // Register with API
        const response = await axios.post(
          "http://localhost:5000/auth/register",
          formData
        );
        
        setMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true);
        console.log("Kayıt başarılı:", response.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                       err.message || 
                       "İşlem başarısız!";
      setMessage(errorMsg);
      console.error("Hata:", err);
    }
  };

  return (
    <div className="login-register-page">
      <h1>{isLogin ? "Giriş Yap" : "Kayıt Ol"}</h1>
      
      {errorMessage && <div className="message error">{errorMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
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
          </>
        )}
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
        <button type="submit">{isLogin ? "Giriş Yap" : "Kayıt Ol"}</button>
      </form> 
      <p>
        {isLogin ? "Hesabınız yok mu? " : "Zaten hesabınız var mı? "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Kayıt Ol" : "Giriş Yap"}
        </button>
      </p>
    </div>
  );
};

export default Login;