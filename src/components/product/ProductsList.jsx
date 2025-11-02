import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProducts, fetchProductsByCategory, selectAllProducts, getProductsStatus, getProductsError } from "../../slices/productsSlice";
import SearchBar from "./SearchBar";

const ProductsList = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const status = useSelector(getProductsStatus);
  const error = useSelector(getProductsError);

  const [searchItem, setSearchItem] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (category) dispatch(fetchProductsByCategory(category));
    else dispatch(fetchProducts());
  }, [category, dispatch]);

  const filteredProducts = searchItem
    ? products.filter(p => p.title?.toLowerCase().includes(searchItem.toLowerCase()))
    : products;

  return (
    <div>
      <SearchBar setSearchItem={setSearchItem} />
      {!searchItem && (
        <div className="group-buttons">
          <button onClick={() => setCategory("")}>All Products</button>
          <button onClick={() => setCategory("Electronics")}>Electronics</button>
          <button onClick={() => setCategory("Jewelry")}>Jewelry</button>
          <button onClick={() => setCategory("Mens clothing")}>Mens Clothing</button>
          <button onClick={() => setCategory("Womens clothing")}>Womens Clothing</button>
        </div>
      )}
      {status === "loading" && <p>Loading products...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <h2>{product.title}</h2>
              <img src={product.image} alt={product.title} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }} />
              <h3>Price: ETB {product.price}</h3>
              <p>{product.category}</p>
              <Link to={`/products/${product.id}`}><button>View Details</button></Link>
            </div>
          ))
        ) : <p>No products found.</p>}
      </div>
    </div>
  );
};

export default ProductsList;
