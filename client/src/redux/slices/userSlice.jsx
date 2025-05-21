import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  setUserId,
  restoreUserBasket,
  loginAndSyncBasket as syncBasket,
  saveBasketBeforeLogout,
} from "./basketSlice";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem("token", action.payload);
        state.isAuthenticated = true;
      } else {
        localStorage.removeItem("token");
        state.isAuthenticated = false;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

// Login and sync basket
export const loginWithBasketSync = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);

    const { user, token, refreshToken } = response.data;

    console.log("Login başarılı:", { user, hasToken: !!token });

    dispatch(setUser(user));
    dispatch(setToken(token));

    // Store refresh token if needed
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Önce kaydedilmiş sepeti getir
    dispatch(restoreUserBasket());

    // Sonra user ID'yi ayarla ve sepeti senkronize et
    if (user && user._id) {
      console.log("Sepet senkronizasyonu başlatılıyor, user ID:", user._id);
      dispatch(setUserId(user._id));
      await dispatch(syncBasket(user._id, token));
    } else {
      console.error("User ID veya token bulunamadı:", { userId: user?._id, hasToken: !!token });
    }

    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Giriş işlemi başarısız oldu";

    dispatch(setError(errorMsg));
    dispatch(setLoading(false));
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // First save the basket
    await dispatch(saveBasketBeforeLogout());
    
    // Then logout
    dispatch(logout());
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    dispatch(setError("Çıkış yaparken bir sorun oluştu"));
    return { success: false, error };
  }
};

// Add the registerUser function
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    dispatch(clearError());

    const response = await axios.post(`${BASE_URL}/auth/register`, userData);

    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message || "Kayıt işlemi başarısız oldu";

    dispatch(setError(errorMsg));
    dispatch(setLoading(false));
    throw error;
  }
};
// Add this to userSlice.js
export const validateToken = (token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.get(`${BASE_URL}/auth/validate-token`, config);

    // Check if we got a success response with user data
    if (response.data && response.data.success && response.data.user) {
      dispatch(setUser(response.data.user));
      dispatch(setToken(token)); // Keep token in state

      console.log("Token doğrulandı, kullanıcı:", response.data.user);

      // Set user ID in basket state if needed
      if (response.data.user._id) {
        dispatch(setUserId(response.data.user._id));
        
        // Sepeti senkronize et (token doğrulandıktan sonra)
        dispatch(syncBasket(response.data.user._id, token));
      }

      dispatch(setLoading(false));
      return true;
    } else {
      // Invalid response
      console.log("Invalid token validation response:", response.data);
      dispatch(logout());
      dispatch(setLoading(false));
      return false;
    }
  } catch (error) {
    console.error("Token validation error:", error);
    dispatch(logout());
    dispatch(setLoading(false));
    return false;
  }
};
export const { setUser, setToken, setLoading, setError, clearError, logout } =
  userSlice.actions;

export default userSlice.reducer;
