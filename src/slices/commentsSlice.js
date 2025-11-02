// slices/commentsSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const COMMENTS_TABLE = import.meta.env.VITE_AIRTABLE_COMMENTS_TABLE;
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${COMMENTS_TABLE}`;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

// Fetch comments for a product
export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (productId) => {
    const filter = encodeURIComponent(`{product_id}='${productId}'`);
    const res = await axios.get(`${AIRTABLE_URL}?filterByFormula=${filter}`, { headers });
    return res.data.records.map(r => ({ id: r.id, ...r.fields }));
  }
);

// Add a comment
export const addComment = createAsyncThunk(
  "comments/addComment",
  async ({ productId, userId, content }) => {
    const payload = {
      records: [
        {
          fields: { product_id: productId, user_id: userId, content }
        }
      ]
    };
    const res = await axios.post(AIRTABLE_URL, payload, { headers });
    return { id: res.data.records[0].id, ...res.data.records[0].fields };
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState: {
    comments: [],
    status: "idle",
    error: null
  },
  reducers: {
    clearComments: (state) => { state.comments = []; state.status = "idle"; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => { state.status = "loading"; })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message; })
      .addCase(addComment.fulfilled, (state, action) => { state.comments.unshift(action.payload); });
  }
});

export const { clearComments } = commentsSlice.actions;
export const selectComments = (state) => state.comments.comments;
export default commentsSlice.reducer;
