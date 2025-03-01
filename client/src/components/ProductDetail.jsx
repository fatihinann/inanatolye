import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllProducts,
  setSelectedProduct,
} from "../redux/slices/productSlice";
import { FaMinus, FaPlus } from "react-icons/fa6";
import {
  addToBasket,
  calculateBasket,
  setDrawerOpen,
  updateProductCount,
} from "../redux/slices/basketSlice";
import "../css/productDetail.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [count, setCount] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { products, selectedProduct, loading, error } = useSelector(
    (store) => store.product
  );

  const basketProducts = useSelector((store) => store.basket.products);
  const basketItem = basketProducts.find((item) => item.id === id);
  const basketCount = basketItem ? basketItem.count : 0;

  useEffect(() => {
    const storedProduct = localStorage.getItem("selectedProduct");

    if (storedProduct) {
      const parsedProduct = JSON.parse(storedProduct);

      if (parsedProduct._id === id) {
        dispatch(setSelectedProduct(parsedProduct));
        return;
      }
    }

    if (products && products.length > 0) {
      getProductById();
    } else {
      dispatch(getAllProducts());
    }
  }, [products, id, dispatch]);

  const getProductById = () => {
    if (products && products.length > 0) {
      // MongoDB formatına göre ID karşılaştırması (string olarak)
      const foundProduct = products.find((product) => product._id === id);

      if (foundProduct) {
        dispatch(setSelectedProduct(foundProduct));
        localStorage.setItem("selectedProduct", JSON.stringify(foundProduct));
      }
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  if (!selectedProduct) {
    return <div>Ürün bulunamadı!</div>;
  }

  const { title, price, description, image, stock, maxQuantity, features } =
    selectedProduct;

  const increment = () => {
    if (count + basketCount < maxQuantity && count < stock) {
      setCount(count + 1);
    } else {
      toast.warning(
        `Bu ürün için maksimum eklenebilecek adet: ${maxQuantity} (Sepette: ${basketCount})`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  const addBasket = () => {
    if (basketCount + count > maxQuantity) {
      toast.warning(
        `Bu üründen maksimum ${maxQuantity} adet ekleyebilirsiniz!`,
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    const payload = {
      id: selectedProduct._id,
      price: Number(price),
      image,
      title,
      count,
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
        <span onClick={() => navigate("/cart")} className="go-to-basket">
          Sepete Git
        </span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
      }
    );
  };

  const handleChange = (id, value) => {
    const newCount = parseInt(value, 10);

    if (isNaN(newCount) || newCount < 1) return;

    dispatch(updateProductCount({ id, count: newCount }));
    dispatch(calculateBasket());
  };

  return (
    <div className="product-detail">
      <div className="product">
        <div className="image">
          <img src={image} alt={title} />
        </div>
        <div className="content">
          <div className="product-content">
            <h3>{title}</h3>
            <p>{price} TL</p>
          </div>
          <div className="count">
            <button
              onClick={decrement}
              className="counter-btn"
              disabled={count === 1}
            >
              <FaMinus />
            </button>
            <input
              className="cart-count"
              value={count}
              onChange={(e) => handleChange(id, e.target.value)}
            />
            <button
              className="counter-btn"
              onClick={increment}
              disabled={count + basketCount >= maxQuantity || count >= stock}
            >
              <FaPlus />
            </button>
          </div>

          <div className="add-to-cart">
            <button onClick={addBasket} disabled={stock === 0}>
              {stock === 0
                ? "Stokta Yok"
                : isAdded
                ? "Sepete Eklendi"
                : "Sepete Ekle"}
            </button>
          </div>
        </div>
      </div>
      <section className="features">
        <h4>Özellikler</h4>
        <p>{description}</p>
        <ul>
          {features &&
            Object.entries(features).map(([key, value]) => (
              <li key={key}>
                <span>{key}</span> <span>{value}</span>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

export default ProductDetail;
