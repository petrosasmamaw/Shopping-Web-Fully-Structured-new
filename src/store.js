// store.js
import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import commentsReducer from "./slices/commentsSlice";

const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    comments: commentsReducer, // if you have comment slice
  },
});

export default store;
