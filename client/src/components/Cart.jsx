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

  const increment = (id, currentCount) => {
    dispatch(updateProductCount({ id, count: currentCount + 1 }));
    dispatch(calculateBasket());
  };

  const decrement = (id, currentCount) => {
    if (currentCount > 1) {
      dispatch(updateProductCount({ id, count: currentCount - 1 }));
      dispatch(calculateBasket());
    }
  };
  const handleChange = (id, value) => {
    const newCount = parseInt(value, 10);

    // Eğer girilen değer sayısal değilse veya 0'dan küçükse güncelleme yapma
    if (isNaN(newCount) || newCount < 1) return;

    dispatch(updateProductCount({ id, count: newCount }));
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
                    <div key={`${product.id}-${index}`} className="cart-item">
                      <div className="image">
                        <img src={product.image} alt={product.title} />
                      </div>
                      <div className="cart-item-info">
                        <span className="cart-title">{product.title}</span>
                        <span className="cart-price">{product.price} TL</span>
                      </div>
                      <div className="count">
                        <button
                          className="counter-btn"
                          onClick={() => {
                            decrement(product.id, product.count);
                          }}
                        >
                          <FaMinus />
                        </button>
                        <input
                          className="cart-count"
                          value={product.count}
                          onChange={(e) =>
                            handleChange(product.id, e.target.value)
                          }
                        />
                        <button
                          className="counter-btn"
                          onClick={() => increment(product.id, product.count)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          dispatch(removeFromBasket({ id: product.id }));
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
