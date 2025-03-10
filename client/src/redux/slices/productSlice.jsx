import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  products: [],
  selectedProduct: {},
  loading: false,
  query: "",
  error: null,
};
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000/products";

export const getAllProducts = createAsyncThunk(
  "getAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      console.log("API'ye istek yapılıyor:", BASE_URL);
      const response = await axios.get(BASE_URL);
      console.log("API yanıtı:", response.data);
      return response.data;
    } catch (error) {
      console.error("API hatası:", error);
      return rejectWithValue(error.response?.data || "Bir hata oluştu");
    }
  }
);
export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getAllProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(getAllProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Bir hata oluştu";
    });
  },
});

export const { setSelectedProduct, setSearchQuery } = productSlice.actions;

export default productSlice.reducer;
