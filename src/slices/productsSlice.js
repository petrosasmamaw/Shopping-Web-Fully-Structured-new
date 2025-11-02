// slices/productsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { addToCart as addToCartAction, syncCartToSupabase } from "./cartSlice";

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

const mapAirtableRecords = (records) =>
  records.map(record => ({
    id: record.id,
    ...record.fields,
    image:
      Array.isArray(record.fields.image) && record.fields.image.length > 0
        ? record.fields.image[0].url
        : "https://via.placeholder.com/200x200.png?text=No+Image",
  }));

export const fetchProducts = createAsyncThunk("products/fetchProducts", async () => {
  const response = await axios.get(AIRTABLE_URL, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return mapAirtableRecords(response.data.records);
});

export const fetchProductsByCategory = createAsyncThunk("products/fetchProductsByCategory", async (category) => {
  const filter = encodeURIComponent(`{category}='${category}'`);
  const response = await axios.get(`${AIRTABLE_URL}?filterByFormula=${filter}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return mapAirtableRecords(response.data.records);
});

export const fetchProductsById = createAsyncThunk("products/fetchProductsById", async (id) => {
  const response = await axios.get(`${AIRTABLE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  const record = response.data;
  return {
    id: record.id,
    ...record.fields,
    image:
      Array.isArray(record.fields.image) && record.fields.image.length > 0
        ? record.fields.image[0].url
        : "https://via.placeholder.com/200x200.png?text=No+Image",
  };
});

// Thunk for adding product to cart and syncing with Supabase
export const addProductToCart = createAsyncThunk(
  "products/addProductToCart",
  async ({ product, quantity, userId }, { dispatch, getState }) => {
    dispatch(addToCartAction({ ...product, quantity }));
    if (userId) {
      const cartItems = getState().cart.items;
      await syncCartToSupabase(userId, cartItems);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], selectedProduct: null, status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, state => { state.status = "loading"; })
      .addCase(fetchProducts.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchProducts.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(fetchProductsByCategory.pending, state => { state.status = "loading"; })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => { state.status = "succeeded"; state.items = action.payload; })
      .addCase(fetchProductsByCategory.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(fetchProductsById.pending, state => { state.status = "loading"; state.selectedProduct = null; })
      .addCase(fetchProductsById.fulfilled, (state, action) => { state.status = "succeeded"; state.selectedProduct = action.payload; })
      .addCase(fetchProductsById.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; });
  }
});

export const selectAllProducts = state => state.products.items;
export const selectSelectedProduct = state => state.products.selectedProduct;
export const getProductsStatus = state => state.products.status;
export const getProductsError = state => state.products.error;

export default productsSlice.reducer;
