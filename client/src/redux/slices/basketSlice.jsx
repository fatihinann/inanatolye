import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for API calls
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

const getBasketFromStorage = () => {
  if (localStorage.getItem("basket")) {
    return JSON.parse(localStorage.getItem("basket"));
  }
  return [];
};

const initialState = {
  products: getBasketFromStorage(),
  totalAmount: 0,
  isDrawerOpen: false,
  userId: null,
  isLoading: false,
  error: null,
};

const writeFromBasketToStorage = (basket) => {
  if (!basket || basket.length === 0) {
    localStorage.removeItem("basket");
  } else {
    localStorage.setItem("basket", JSON.stringify(basket));
  }
};

export const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    // Reducers remain the same...
    setBasket: (state, action) => {
      state.products = action.payload;
      writeFromBasketToStorage(action.payload);
    },
    addToBasket: (state, action) => {
      // Same implementation...
    },
    setDrawerOpen: (state) => {
      state.isDrawerOpen = true;
    },
    setDrawerClose: (state) => {
      state.isDrawerOpen = false;
    },
    calculateBasket: (state) => {
      state.totalAmount = state.products.reduce(
        (total, product) => total + product.price,
        0
      );
    },
    // Other reducers remain the same...
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Updated Thunk with proper token handling
export const loginAndSyncBasket = (userId, token) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    
    // Get the guest basket
    const guestBasket = getBasketFromStorage();
    
    // Update user ID in the basket state
    dispatch(setUserId(userId));
    
    // Validate token
    if (!token) {
      console.error("Token bulunamadı. Lütfen tekrar giriş yapın.");
      dispatch(setError("Yetkilendirme hatası: Token bulunamadı"));
      dispatch(setLoading(false));
      return;
    }
    
    // Set up headers with the token
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Get user's server-side basket
    let userBasket = [];
    try {
      const response = await axios.get(`${BASE_URL}/api/basket/${userId}`, config);
      userBasket = response.data;
    } catch (error) {
      // Handle 404 (no basket yet) or other errors
      if (error.response && error.response.status === 404) {
        console.log("Kullanıcı sepeti bulunamadı, yeni sepet oluşturulacak");
        userBasket = [];
      } else if (error.response && error.response.status === 401) {
        dispatch(setError("Yetkilendirme hatası: Lütfen tekrar giriş yapın"));
        dispatch(setLoading(false));
        return;
      } else {
        throw error;
      }
    }
    
    // Merge baskets
    const mergedBasket = mergeBaskets(guestBasket, userBasket);
    
    // Sync the merged basket with the server
    try {
      await axios.post(
        `${BASE_URL}/api/basket/${userId}/sync`, 
        { items: mergedBasket }, 
        config
      );
    } catch (error) {
      console.error("Sepet senkronizasyon hatası:", error.response?.data);
    }
    
    // Restore any saved basket from previous login
    dispatch(restoreUserBasket());
    
    // Update Redux store
    dispatch(setBasket(mergedBasket));
    dispatch(calculateBasket());
    dispatch(setLoading(false));
  } catch (err) {
    console.error("Login ve sepet senkronizasyon hatası:", err);
    dispatch(setError("Sepet senkronizasyon hatası: " + (err.response?.data?.message || err.message)));
    dispatch(setLoading(false));
  }
};

// Other thunks with updated token handling
export const fetchBasket = () => async (dispatch, getState) => {
  try {
    const { userId } = getState().basket;
    const token = getState().users.token;  // Get token from user state
    
    if (userId && token) {
      const response = await axios.get(`${BASE_URL}/api/basket/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(setBasket(response.data));
    } else {
      const guestBasket = getBasketFromStorage();
      dispatch(setBasket(guestBasket));
    }
  } catch (err) {
    console.error("Sepet alınamadı:", err);
  }
};

// Helper function remains the same
const mergeBaskets = (guestBasket, userBasket) => {
  // Same implementation...
};

export const {
  addToBasket,
  setDrawerClose,
  setDrawerOpen,
  calculateBasket,
  removeFromBasket,
  updateProductCount,
  clearBasket,
  setBasket,
  setUserId,
  setLoading,
  setError,
  saveBasketBeforeLogout,
  restoreUserBasket
} = basketSlice.actions;

export default basketSlice.reducer;