import { createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase/supabaseClient";

const initialState = {
  items: [],
  totalPrice: 0,
};

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += item.quantity || 1;
        existing.subtotal = existing.quantity * existing.price;
      } else {
        state.items.push({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          subtotal: item.price * (item.quantity || 1),
        });
      }

      state.totalPrice = calculateTotal(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalPrice = calculateTotal(state.items);
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          item.subtotal = item.price * item.quantity;
        } else {
          state.items = state.items.filter((i) => i.id !== item.id);
        }
      }
      state.totalPrice = calculateTotal(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },

    setCart: (state, action) => {
      state.items = action.payload;
      state.totalPrice = calculateTotal(state.items);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decreaseQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectTotalPrice = (state) => state.cart.totalPrice;

export default cartSlice.reducer;

// Async Supabase helpers
export const syncCartToSupabase = async (userId, items) => {
  if (!userId) return;
  try {
    const timestamp = new Date().toISOString();
    const payload = { user_id: userId, cart_data: items, updated_at: timestamp };

    const { data: existingRows, error: findErr } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (findErr) return null;

    if (existingRows?.length > 0) {
      const existingId = existingRows[0].id;
      const { data: updated, error: updateErr } = await supabase
        .from("carts")
        .update({ cart_data: items, updated_at: timestamp })
        .eq("id", existingId)
        .select();
      return updated;
    } else {
      if (!items || items.length === 0) return [];
      const { data: inserted, error: insertErr } = await supabase
        .from("carts")
        .insert(payload)
        .select();
      return inserted;
    }
  } catch (e) {
    console.error("Error syncing cart:", e);
    return null;
  }
};

export const fetchCartFromSupabase = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("carts")
    .select("cart_data, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return [];
  return data?.cart_data || [];
};
