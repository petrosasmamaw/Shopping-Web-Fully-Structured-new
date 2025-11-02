// App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "./components/navbar/NavBar.jsx";
import ProductsList from "./components/product/ProductsList.jsx";
import ProductsDetail from "./components/product/ProductsDetail.jsx";
import Cart from "./components/cart/Cart.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";

import { supabase } from "./supabase/supabaseClient.js";
import { fetchCartFromSupabase, setCart, selectCartItems, syncCartToSupabase } from "./slices/cartSlice";

const App = () => {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

  // ✅ Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Sync cart when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        const savedCart = await fetchCartFromSupabase(user.id);
        dispatch(setCart(savedCart));
      }
    };
    loadCart();
  }, [user, dispatch]);

  // ✅ Sync cart changes to Supabase
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      syncCartToSupabase(user.id, cartItems);
    }, 400);
    return () => clearTimeout(timer);
  }, [cartItems, user]);

  return (
    <div className="app">
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<ProductsList />} />
        <Route path="/products/:id" element={<ProductsDetail user={user} />} />
        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;
