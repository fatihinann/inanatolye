import React, { useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation ekleyin
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
  const location = useLocation(); // Mevcut URL'yi al
  const { products, totalAmount, isDrawerOpen } = useSelector(
    (store) => store.basket
  );

  useEffect(() => {
    const pathSegments = location.pathname.split("/");
    const isHomePage = location.pathname === "/";
    const isProductPage = pathSegments.length === 2 && pathSegments[1] !== "";
    const isBasketPage = location.pathname === "/cart"; // Sepet sayfası kontrolü
  
    if ((isHomePage || isProductPage) && products.length > 0 && !isBasketPage) {
      dispatch(calculateBasket());
      dispatch(setDrawerOpen()); // Drawer'ı aç
    } else {
      dispatch(setDrawerClose()); // Drawer'ı kapat
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
            <div key={`${product.id}-${index}`} className="cart-item">
              <div className="image" onClick={() => navigate("/" + product.id)}>
                <img src={product.image} alt={product.title} />
              </div>
              <div className="content">
                <span className="cart-price">{product.price} TL</span>
                <div>
                  <span className="cart-count">Adet: {product.count}</span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromBasket({ id: product.id }));
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
