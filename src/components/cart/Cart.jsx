import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectCartItems, selectTotalPrice, removeFromCart, decreaseQuantity, clearCart } from "../../slices/cartSlice";
import SendOrder from "./SendOrder";

const Cart = ({ user }) => {
  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);
  const dispatch = useDispatch();

  if (!user) return <p>Please login to manage your cart.</p>;

  return (
    <div className="cart">
      <h2>🛒 My Cart</h2>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <Link to={`/products/${item.id}`}>{item.title}</Link> - ${item.price} x {item.quantity} = <b>${item.subtotal.toFixed(2)}</b>
                <br/>
                <button onClick={() => dispatch(decreaseQuantity(item.id))}>-</button>
                <button onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${totalPrice.toFixed(2)}</h3>
          <button onClick={() => dispatch(clearCart())}>Clear Cart</button>
          <SendOrder user={user} cartItems={items} totalPrice={totalPrice} />
        </>
      )}
    </div>
  );
};

export default Cart;
