import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { setUserId, restoreUserBasket, loginAndSyncBasket as syncBasket } from "./basketSlice";

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
    
    dispatch(setUser(user));
    dispatch(setToken(token));
    
    // Store refresh token if needed
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    
    // Set user ID in basket state and sync the basket
    if (user && user._id) {
      // First set the user ID
      dispatch(setUserId(user._id));
      
      // Then sync basket with updated API calls
      await dispatch(syncBasket(user._id, token));
      
      // Then restore any previously saved basket if needed
      dispatch(restoreUserBasket());
    }
    
    dispatch(setLoading(false));
    return response.data;
  } catch (error) {
    const errorMsg = 
      error.response?.data?.message || 
      "Giriş işlemi başarısız oldu";
    
    dispatch(setError(errorMsg));
    dispatch(setLoading(false));
    throw error;
  }
};

// Add the logoutUser function (using the existing logout reducer)
export const logoutUser = () => (dispatch) => {
  try {
    // Call the logout reducer
    dispatch(logout());
    // You can add any additional logout logic here if needed
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
      error.response?.data?.message || 
      "Kayıt işlemi başarısız oldu";
    
    dispatch(setError(errorMsg));
    dispatch(setLoading(false));
    throw error;
  }
};
// Add this to userSlice.js
export const validateToken = (token) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Set up headers with the token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Verify token with server
    const response = await axios.get(`${BASE_URL}/auth/validate-token`, config);
    
    // If token is valid, set user data
    if (response.data && response.data.user) {
      dispatch(setUser(response.data.user));
      dispatch(setToken(token)); // Ensure token is set in state
      dispatch(setLoading(false));
      return true;
    } else {
      // Token invalid
      dispatch(logout());
      dispatch(setLoading(false));
      return false;
    }
  } catch (error) {
    console.error("Token validation error:", error);
    // If there's an error, the token is likely invalid
    dispatch(logout());
    dispatch(setLoading(false));
    return false;
  }
};
export const { 
  setUser, 
  setToken, 
  setLoading, 
  setError, 
  clearError, 
  logout 
} = userSlice.actions;

export default userSlice.reducer;