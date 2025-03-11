import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addToBasket,
  calculateBasket,
  setDrawerOpen,
  setDrawerClose,
  addItemToBasketAPI,
} from "../redux/slices/basketSlice";
import { useNavigate } from "react-router-dom";
import "../css/product.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Product({ product }) {
  const navigate = useNavigate();
  const { _id, price, image, title, stock, maxQuantity } = product;
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.users.currentUser?._id);
  const token = useSelector((state) => state.users.token);
  const [loading, setLoading] = useState(false);

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
  
    // Create basket item with consistent property names
    const basketItem = {
      productId: _id,
      price: Number(price),
      image,
      name: title,
      quantity: 1
    };
  
    if (userId && token) {
      setLoading(true);
      dispatch(addItemToBasketAPI(basketItem, token))
        .then(() => {
          handleAddToCart();
          dispatch(setDrawerOpen());
          setIsAdded(true);
          setTimeout(() => setIsAdded(false), 3000);
          setLoading(false);
        })
        .catch((error) => {
          toast.error("Ürün sepete eklenirken bir hata oluştu");
          setLoading(false);
        });
    } else {
      // For guest users, add to local cart
      dispatch(addToBasket(basketItem));
      dispatch(calculateBasket());
      handleAddToCart();
      dispatch(setDrawerOpen());
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 3000);
    }
  };

  const [isAdded, setIsAdded] = useState(false);
  
  // Find how many of this product are in cart
  const basketItems = useSelector((state) => state.basket.products);
  const basketItem = basketItems.find((item) => item.productId === _id);  // Changed from 'id' to 'productId'
  const currentQuantityInBasket = basketItem ? basketItem.quantity : 0;  // Changed from 'count' to 'quantity'

  // Check user authentication status
  const isAuthenticated = useSelector(
    (state) => state.users?.isAuthenticated ?? false
  );

  // Stock and max quantity checks
  const isOutOfStock = stock === 0;
  const isMaxQuantityReached = currentQuantityInBasket >= maxQuantity;

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
    <div className="product" onClick={() => navigate(`${_id}`)}>
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
          disabled={stock === 0 || loading}
        >
          {stock === 0
            ? "Stokta Yok"
            : loading
            ? "Ekleniyor..."
            : isAdded
            ? "Sepete Eklendi"
            : "Sepete Ekle"}
        </button>
      </div>
    </div>
  );
}

export default Product;