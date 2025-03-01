import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToBasket,
  calculateBasket,
  setDrawerClose,
  setDrawerOpen,
} from "../redux/slices/basketSlice";
import { useNavigate } from "react-router-dom";
import "../css/product.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Product({ product }) {
  const navigate = useNavigate();
  const { _id, price, image, title, stock, maxQuantity } = product;
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);
  
  // Sepetteki bu üründen kaç adet olduğunu bul
  const basketItems = useSelector((state) => state.basket.products);
  const basketItem = basketItems.find((item) => item.id === _id);
  const currentQuantityInBasket = basketItem ? basketItem.count : 0;
  
  // Kullanıcı durumunu kontrol et
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated ?? false);

  // Stok ve maksimum adet kontrolü
  const isOutOfStock = stock === 0;
  const isMaxQuantityReached = currentQuantityInBasket >= maxQuantity;

  const addBasket = () => {
    if (isOutOfStock) {
      toast.error("Ürün stokta bulunmamaktadır.");
      return;
    }

    if (isMaxQuantityReached) {
      dispatch(setDrawerOpen());
      toast.error(`Bir kullanıcı en fazla ${maxQuantity} adet ekleyebilir.`);
      return;
    }

    const payload = {
      id: _id,
      price: Number(price),
      image,
      title,
      count: 1,
      maxQuantity,
    };

    dispatch(addToBasket(payload));
    dispatch(calculateBasket());
    handleAddToCart();
    dispatch(setDrawerOpen());

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3000);
  };

  const handleAddToCart = () => {
    toast.success(
      <div className="toast-content">
        <span>Ürün sepete eklendi</span>
        <span
          onClick={() => {
            navigate("/cart");
            dispatch(setDrawerClose());
          }}
          className="go-to-basket"
        >
          Sepete Git
        </span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
      }
    );
  };

  return (
    <div className="product" onClick={() => navigate(`/product/${_id}`)}>
      <div className="image">
        <img src={image} alt={title} />
      </div>
      <div className="content">
        <div className="product-title">{title}</div>
        <span className="product-price">{price} TL</span>
      </div>
      <div className="p-add-cart">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addBasket();
          }}
          disabled={stock === 0}
        >
          {stock === 0
            ? "Stokta Yok"
            : isAdded
            ? "Sepete Eklendi"
            : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
}

export default Product;