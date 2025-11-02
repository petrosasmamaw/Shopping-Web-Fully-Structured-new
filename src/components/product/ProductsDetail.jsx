import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsById, selectSelectedProduct, getProductsStatus, getProductsError, addProductToCart } from "../../slices/productsSlice";
import Comments from "../comments/Comments";

const ProductsDetail = ({ user }) => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const product = useSelector(selectSelectedProduct);
  const status = useSelector(getProductsStatus);
  const error = useSelector(getProductsError);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) dispatch(fetchProductsById(id));
  }, [id, dispatch]);

  const handleAddToCart = async () => {
    if (!product) return;
    dispatch(addProductToCart({ product, quantity, userId: user?.id }));
  };

  if (status === "loading") return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>No product found.</p>;

  return (
    <div className="product-detail">
      <h2>{product.title}</h2>
      <img src={product.image} alt={product.title} />
      <h3>ETB {product.price}</h3>
      <p>{product.description}</p>

      <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
      <button onClick={handleAddToCart}>Add to Cart</button>

      <Link to="/"><button>Back to Products</button></Link>

      {product.id && <Comments productId={product.id} user={user} />}
    </div>
  );
};

export default ProductsDetail;
