import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ProductDetail from "../components/ProductDetail";
import Cart from "../components/Cart";
import Login from "../components/Login";
import Register from "../components/Register";
function RouterConfig() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:id" element={<ProductDetail />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
}

export default RouterConfig;
