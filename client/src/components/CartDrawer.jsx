import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrashAlt } from "react-icons/fa";
import {
  calculateBasket,
  setDrawerClose,
  setDrawerOpen,
  clearBasketAPI,
  removeFromBasketAPI,
} from "../redux/slices/basketSlice";

function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, totalAmount, isDrawerOpen, isLoading, basketLoaded } = useSelector(
    (store) => store.basket
  );
  const { isAuthenticated } = useSelector((store) => store.users);

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
            dispatch(clearBasketAPI());
          }}
          disabled={isLoading}
        >
          {isLoading ? "İşleniyor..." : "Tümünü Sil"}
        </button>
        <p>Toplam: {netTutar} TL</p>
      </div>
      <div className="cart-items">
        {isLoading ? (
          <div className="loading">Yükleniyor...</div>
        ) : products && products.length > 0 ? (
          products.map((product, index) => (
            <div key={`${product.productId}-${index}`} className="cart-item">
              <div
                className="image"
                onClick={() => navigate("/" + product.productId)}
              >
                <img src={product.image} alt={product.name} />
              </div>
              <div className="content">
                <span className="cart-price">{product.price} TL</span>
                <div>
                  <span className="cart-quantity">
                    Adet: {product.quantity}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(removeFromBasketAPI(product.productId));
                    }}
                    disabled={isLoading}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-cart">Sepetiniz boş</div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;