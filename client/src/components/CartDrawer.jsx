import React, { useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  calculateBasket,
  removeFromBasket,
  clearBasket,
  setDrawerClose,
  setDrawerOpen,
} from "../redux/slices/basketSlice";

function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, totalAmount, isDrawerOpen } = useSelector(
    (store) => store.basket
  );

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const isHomePage = location.pathname === "/";
    const isProductPage = pathSegments.length === 2 && pathSegments[1] !== "";
    const isBasketPage = location.pathname === "/cart";
    
    if ((isHomePage || isProductPage) && products.length > 0 && !isBasketPage) {
      dispatch(calculateBasket());
      dispatch(setDrawerOpen());
    } else {
      dispatch(setDrawerClose());
    }
  }, [location.pathname, products, dispatch]);

  useEffect(() => {
    const appContent = document.querySelector(".app");
    if (appContent) {
      if (isDrawerOpen) {
        appContent.classList.add("drawer-open");
      } else {
        appContent.classList.remove("drawer-open");
      }
    }
  }, [isDrawerOpen]);

  const netTutar = Math.round(totalAmount * 100) / 100;

  return (
    <div className={`cart-drawer ${isDrawerOpen ? "open" : ""}`}>
      <div className="cart-header">
        <button
          onClick={() => {
            navigate("/cart");
            dispatch(setDrawerClose());
          }}
        >
          Sepete Git
        </button>
        <button
          onClick={() => {
            dispatch(clearBasket());
            dispatch(calculateBasket());
          }}
        >
          Tümünü Sil
        </button>
        <p>Toplam: {netTutar} TL</p>
      </div>
      <div className="cart-items">
        {products &&
          products.map((product, index) => (
            <div key={`${product.productId}-${index}`} className="cart-item">
              <div className="image" onClick={() => navigate("/" + product.productId)}>
                <img src={product.image} alt={product.name} />
              </div>
              <div className="content">
                <span className="cart-price">{product.price} TL</span>
                <div>
                  <span className="cart-quantity">Adet: {product.quantity}</span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromBasket(product.productId));
                      dispatch(calculateBasket());
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default CartDrawer;