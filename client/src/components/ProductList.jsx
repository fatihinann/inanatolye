import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../redux/slices/productSlice";
import Product from "./Product";
import "../css/home.scss";
function ProductList() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getAllProducts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const query = useSelector((state) => state.product.query);

  const filteredProducts = query
    ? products.filter(
        (product) =>
          product.title &&
          typeof product.title === "string" &&
          product.title.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <>
      {loading && <p>Yükleniyor...</p>}
      {error && <p className="error">{error}</p>} {/* Hata mesajı */}
      {query && (
        <div className="search-result">
          <span>{query}</span> ile ilgili <b>{filteredProducts.length}</b> ürün
          bulundu
        </div>
      )}
      <section className="products">
        {filteredProducts.map((product) => (
          <Product key={product._id} product={product} />
        ))}
      </section>
    </>
  );
}

export default ProductList;
