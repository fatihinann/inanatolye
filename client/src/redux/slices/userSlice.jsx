// 1. First, update your userSlice.js to handle and store JWT tokens
import { createSlice } from "@reduxjs/toolkit";
import { logout, loginAndSyncBasket } from "./basketSlice";
import axios from "axios";

// Get user data and token from localStorage
const getUserFromStorage = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

const getTokenFromStorage = () => {
  return localStorage.getItem("token") || null;
};

const initialState = {
  users: localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [],
  currentUser: getUserFromStorage(),
  token: getTokenFromStorage(),  // Add token to state
  refreshToken: localStorage.getItem("refreshToken") || null,  // Store refresh token too
  isAuthenticated: !!getUserFromStorage() && !!getTokenFromStorage(),
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    registerUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: Date.now().toString()
      };
      
      const emailExists = state.users.some(user => user.email === newUser.email);
      if(emailExists) throw new Error("Bu e-posta zaten kayıtlı!");

      state.users.push(newUser);
      localStorage.setItem("users", JSON.stringify(state.users));
    },
    
    loginUser: (state, action) => {
      const { email, password } = action.payload;
      const user = state.users.find(u => u.email === email && u.password === password);
    
      if (!user) {
        state.error = "Geçersiz kimlik bilgileri!";
        return;
      }
    
      state.currentUser = user;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem("currentUser", JSON.stringify(user));
    },
    
    // Add a new action to set token after API login
    setAuthTokens: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      
      // Store tokens in localStorage
      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
    },
    
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
      
      // Clear storage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
    
    loginSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    
    // Other reducers remain the same...
  }
});

// Updated Thunk to use API for authentication
export const loginWithBasketSync = (credentials) => async (dispatch) => {
  try {
    // First, authenticate with the backend API
    const response = await axios.post(
      "http://localhost:5000/auth/login",
      credentials
    );
    
    // Check if the API response contains token and user data
    if (response.data && response.data.token) {
      // Store the user and tokens in Redux
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken
      }));
      
      // Sync the basket with the user ID and token
      if (response.data.user && response.data.user._id) {
        await dispatch(loginAndSyncBasket(response.data.user._id, response.data.token));
      }
      
      return Promise.resolve();
    } else {
      return Promise.reject("Authentication failed: Invalid server response");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Authentication failed";
    dispatch({ type: "users/loginFailed", payload: errorMessage });
    return Promise.reject(errorMessage);
  }
};

export const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  loginSuccess,
  setAuthTokens
} = usersSlice.actions;

export default usersSlice.reducer;