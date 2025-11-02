import React, { useState } from "react";
import { useDispatch } from "react-redux";
import emailjs from "emailjs-com";
import { clearCart } from "../../slices/cartSlice";
import { supabase } from "../../supabase/supabaseClient";

const SendOrder = ({ user, cartItems, totalPrice }) => {
  const [isSending, setIsSending] = useState(false);
  const dispatch = useDispatch();

  const handleSendOrder = async () => {
    if (!user?.id || !user?.email) return alert("Please login first!");
    if (!cartItems.length) return alert("Your cart is empty!");

    setIsSending(true);
    const orderSummary = cartItems.map(item => `${item.title} (x${item.quantity}) - $${item.price}`).join("\n");
    const itemNames = cartItems.map(item => item.title);

    try {
      // Email to customer
      await emailjs.send("service_f9p0p7b", "template_5xv3bke", {
        to_name: user.name || user.email,
        to_email: user.email,
        order_summary: orderSummary,
        total_price: totalPrice.toFixed(2),
        order_date: new Date().toLocaleString()
      }, "BeGy3nai4D3iywEnN");

      // Email to admin
      await emailjs.send("service_f9p0p7b", "template_dsaauta", {
        customer_email: user.email,
        order_summary: orderSummary,
        total_price: totalPrice.toFixed(2)
      }, "BeGy3nai4D3iywEnN");

      // Save order to Supabase
      const { error } = await supabase.from("orders").insert([{
        user_id: user.id,
        user_email: user.email,
        cart_data: cartItems,
        item_names: itemNames,
        total_price: totalPrice,
        order_date: new Date().toISOString(),
        status: "pending"
      }]);

      if (error) alert("Failed to save order to database!");
      else { alert("✅ Invoice sent & order saved!"); dispatch(clearCart()); }

    } catch (e) { alert("Failed to send order."); }
    finally { setIsSending(false); }
  };

  return (
    <button
      onClick={handleSendOrder}
      disabled={isSending}
      className={`px-4 py-2 rounded-lg text-white ${isSending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
    >
      {isSending ? "Sending..." : "Send Order"}
    </button>
  );
};

export default SendOrder;
