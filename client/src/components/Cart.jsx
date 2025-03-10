import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { FaTrashAlt } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import {
  calculateBasket,
  removeFromBasket,
  clearBasket,
  updateProductCount,
} from "../redux/slices/basketSlice";
import ProductList from "./ProductList";

function Cart() {
  const dispatch = useDispatch();
  const { products, totalAmount } = useSelector((store) => store.basket);

  const increment = (productId, currentQuantity) => {
    dispatch(updateProductCount({ productId, quantity: currentQuantity + 1 }));
    dispatch(calculateBasket());
  };

  const decrement = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateProductCount({ productId, quantity: currentQuantity - 1 }));
      dispatch(calculateBasket());
    }
  };
  
  const handleChange = (productId, value) => {
    const newQuantity = parseInt(value, 10);
    
    // Eğer girilen değer sayısal değilse veya 0'dan küçükse güncelleme yapma
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
    dispatch(updateProductCount({ productId, quantity: newQuantity }));
    dispatch(calculateBasket());
  };

  useEffect(() => {
    dispatch(calculateBasket());
  }, [dispatch, products]);
  const netTutar = Math.round(totalAmount * 100) / 100;
  return (
    <div className="cart-container">
      {products.length > 0 ? (
        <div className="cart-info">
          <div className="cart">
            <div className="cart-header">
              <span>Sepetim ({products.length})</span>
              <button
                onClick={() => {
                  dispatch(clearBasket());
                  dispatch(calculateBasket());
                }}
              >
                Tümünü Sil
              </button>
            </div>

            <div className="cart-items">
              {products &&
                products.map((product, index) => {
                  return (
                    <div
                      key={`${product.productId}-${index}`}
                      className="cart-item"
                    >
                      <div className="image">
                        <img src={product.image} alt={product.name} />
                      </div>
                      <div className="cart-item-info">
                        {console.log(product)}
                        <span className="cart-title">{product.name}</span>
                        <span className="cart-price">{product.price} TL</span>
                      </div>
                      <div className="count">
                        <button
                          className="counter-btn"
                          onClick={() => {
                            decrement(product.productId, product.quantity);
                          }}
                        >
                          <FaMinus />
                        </button>
                        <input
                          className="cart-count"
                          value={product.quantity}
                          onChange={(e) =>
                            handleChange(product.productId, e.target.value)
                          }
                        />
                        <button
                          className="counter-btn"
                          onClick={() =>
                            increment(product.productId, product.quantity)
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          dispatch(removeFromBasket(product.productId));
                          dispatch(calculateBasket());
                        }}
                      >
                        <FaTrashAlt />
                        Sil
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="summary-container">
            <div className="summary-wrapper radius">
              <div className="summary">
                <span>Sipariş Özeti ({products.length})</span>
                <div className="total">
                  <span>Toplam</span>
                  <span>
                    {netTutar}
                    <span>TL</span>
                  </span>
                </div>
              </div>
              <button>Alışverişi Tamamla</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="empty-cart-message">
            <div className="empty-cart-icon">
              <FaCartShopping />
            </div>
            <h4>Sepetiniz şu an boş</h4>
            <div className="empty-cart-text">
              Ürünlerimize göz atarak ihtiyacınız olanı bulabilirsiniz. Eğer
              aradığınız ürünü bulamadıysanız, lütfen bize ulaşın. Sizin için
              özel bir proje oluşturalım!
            </div>
          </div>
        </div>
      )}
      <ProductList />
    </div>
  );
}

export default Cart;
