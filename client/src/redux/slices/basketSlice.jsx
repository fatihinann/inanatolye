import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for API calls
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Get basket from storage with better error handling
const getBasketFromStorage = () => {
  try {
    const storedBasket = localStorage.getItem("basket");
    return storedBasket ? JSON.parse(storedBasket) : [];
  } catch (error) {
    console.error("Error parsing basket from storage:", error);
    return [];
  }
};

const initialState = {
  products: getBasketFromStorage(),
  totalAmount: 0,
  isDrawerOpen: false,
  userId: null,
  isLoading: false,
  error: null,
  basketLoaded: false,
};

// Save basket to storage with better error handling
const writeFromBasketToStorage = (basket) => {
  try {
    if (!basket || basket.length === 0) {
      localStorage.removeItem("basket");
    } else {
      localStorage.setItem("basket", JSON.stringify(basket));
    }
  } catch (error) {
    console.error("Error saving basket to storage:", error);
  }
};

// Improved mergeBaskets function with consistent property names
const mergeBaskets = (guestBasket, userBasket) => {
  // Create a copy of the user's basket to start with
  const mergedBasket = [...userBasket];

  // Go through each item in the guest basket
  guestBasket.forEach((guestItem) => {
    // Check if this product already exists in the user's basket
    const existingItemIndex = mergedBasket.findIndex(
      (item) => item.productId === guestItem.productId
    );

    if (existingItemIndex >= 0) {
      // If it exists, update the quantity
      mergedBasket[existingItemIndex].quantity += guestItem.quantity || 1;
    } else {
      // If it doesn't exist, add it to the merged basket
      mergedBasket.push({ ...guestItem });
    }
  });

  return mergedBasket;
};

export const basketSlice = createSlice({
  name: "basket",
  initialState,
  reducers: {
    setBasket: (state, action) => {
      state.products = action.payload;
      writeFromBasketToStorage(action.payload);
    },
    addToBasket: (state, action) => {
      const { productId, name, price, image, quantity = 1 } = action.payload;

      // Check if the product is already in the basket
      const existingItem = state.products.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        // If it exists, increment the quantity
        existingItem.quantity += quantity;
      } else {
        // If it doesn't exist, add a new item
        state.products.push({
          productId,
          name,
          price,
          image,
          quantity,
        });
      }

      // Update local storage
      writeFromBasketToStorage(state.products);
    },
    setDrawerOpen: (state) => {
      state.isDrawerOpen = true;
    },
    setDrawerClose: (state) => {
      state.isDrawerOpen = false;
    },
    calculateBasket: (state) => {
      state.totalAmount = state.products.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );
    },
    removeFromBasket: (state, action) => {
      state.products = state.products.filter(
        (item) => item.productId !== action.payload
      );
      writeFromBasketToStorage(state.products);
    },
    updateProductCount: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.products.find((item) => item.productId === productId);

      if (item) {
        item.quantity = quantity;
      }

      writeFromBasketToStorage(state.products);
    },
    setBasketLoaded: (state, action) => {
      state.basketLoaded = action.payload;
    },
    clearBasket: (state) => {
      state.products = [];
      localStorage.removeItem("basket");
    },
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

// Improved login and sync basket function
export const loginAndSyncBasket = (userId, token) => async (dispatch) => {
  try {
    console.log("Sepet senkronizasyonu başladı:", { userId, hasToken: !!token });
    
    if (!userId || !token) {
      console.error("UserId veya token eksik:", { userId, hasToken: !!token });
      return; // Hata fırlatmadan sessizce çık
    }

    dispatch(setLoading(true));

    // Clear existing basket state
    // dispatch(setBasket([])); // Bu satırı kaldırın veya yorum satırına alın

    const guestBasket = getBasketFromStorage();

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    console.log("Sepet API'sine istek gönderiliyor...");
    
    // First, get user's existing cart
    const existingCart = await axios.get(`${BASE_URL}/cart`, config);
    console.log("Mevcut sepet alındı:", existingCart.data);

    // Merge guest basket with existing cart
    const itemsToSync =
      guestBasket.length > 0 ? guestBasket : existingCart.data?.items || [];
    
    console.log("Senkronize edilecek öğeler:", itemsToSync);

    // Sync with server
    const syncResponse = await axios.post(
      `${BASE_URL}/cart/sync`,
      {
        items: itemsToSync.map((item) => ({
          productId: item.productId,
          quantity: item.quantity || 1,
        })),
      },
      config
    );

    console.log("Senkronizasyon yanıtı:", syncResponse.data);

    if (syncResponse.data && syncResponse.data.items) {
      const updatedBasket = syncResponse.data.items.map((item) => ({
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
        name: item.productId.name || "",
        price: item.productId.price || 0,
        image: item.productId.image || "",
      }));

      dispatch(setBasket(updatedBasket));
      dispatch(calculateBasket());

      // Clear guest basket after successful sync
      localStorage.removeItem("basket");
    }

    dispatch(setBasketLoaded(true));
    dispatch(setLoading(false));
  } catch (err) {
    console.error("Login ve sepet senkronizasyon hatası:", err);
    dispatch(
      setError(
        "Sepet senkronizasyon hatası: " +
          (err.response?.data?.message || err.message)
      )
    );
    dispatch(setLoading(false));
  }
};

// Improved API function for adding items to basket
export const addItemToBasketAPI =
  (productData, token) => async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Send request to the backend
      const response = await axios.post(
        `${BASE_URL}/cart/items`,
        {
          productId: productData.productId,
          quantity: parseInt(productData.quantity) || 1, // Ensure quantity is a number
        },
        config
      );

      // Always use the server response to update local state
      if (response.data && response.data.items) {
        const updatedBasket = response.data.items.map((item) => ({
          productId: item.productId._id || item.productId,
          quantity: parseInt(item.quantity),
          name: item.productId.name || "",
          price: item.productId.price || 0,
          image: item.productId.image || "",
        }));

        dispatch(setBasket(updatedBasket));
        dispatch(calculateBasket());
      }

      dispatch(setLoading(false));
    } catch (error) {
      console.error("Sepete ekleme hatası:", error);
      dispatch(setError("Ürün sepete eklenirken bir hata oluştu"));
      dispatch(setLoading(false));
      throw error;
    }
  };

export const fetchBasket = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const token = getState().users.token;
    const userId = getState().users.currentUser?._id; // Add userId check
    const isAuthenticated = getState().users.isAuthenticated;

    // Clear any existing basket data first
    dispatch(setBasket([]));

    if (!token || !userId || !isAuthenticated) {
      // If not authenticated, use guest basket
      const guestBasket = getBasketFromStorage();
      dispatch(setBasket(guestBasket));
      dispatch(calculateBasket());
      dispatch(setBasketLoaded(true));
      dispatch(setLoading(false));
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await axios.get(`${BASE_URL}/cart`, config);

      let basketItems = [];
      if (
        response.data &&
        response.data.items &&
        response.data.items.length > 0
      ) {
        basketItems = response.data.items.map((item) => ({
          productId: item.productId._id || item.productId,
          quantity: item.quantity,
          name: item.productId.name || "",
          price: item.productId.price || 0,
          image: item.productId.image || "",
        }));
      }

      dispatch(setBasket(basketItems));
      dispatch(calculateBasket());
      dispatch(setBasketLoaded(true));
    } catch (error) {
      console.error("Sepet çekilirken hata:", error);
      dispatch(setBasket([]));
      dispatch(calculateBasket());
    }

    dispatch(setLoading(false));
  } catch (err) {
    console.error("Error fetching basket:", err);
    dispatch(setLoading(false));
    dispatch(setBasket([]));
    dispatch(calculateBasket());
    dispatch(setBasketLoaded(true));
  }
};

// Improved function to save user's basket before logout
export const saveBasketBeforeLogout = () => async (dispatch, getState) => {
  try {
    const currentBasket = getState().basket.products;
    const token = getState().users.token;

    // Only proceed if there are items and user is authenticated
    if (currentBasket && currentBasket.length > 0 && token) {
      // First, save to local storage as backup
      localStorage.setItem("savedUserBasket", JSON.stringify(currentBasket));

      // Then try to sync with the server before logging out
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        `${BASE_URL}/cart/sync`,
        {
          items: currentBasket.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        config
      );

      console.log("Basket successfully synced before logout");
    }
  } catch (err) {
    console.error("Sepet çıkış öncesi kaydedilirken hata:", err);
    // Keep the backup in localStorage in case of error
  }
};

// Function to restore user's basket after login
export const restoreUserBasket = () => (dispatch, getState) => {
  try {
    const savedBasket = localStorage.getItem("savedUserBasket");
    if (savedBasket) {
      const basket = JSON.parse(savedBasket);
      dispatch(setBasket(basket));
      dispatch(calculateBasket());
      
      // Burayı kaldırın veya devre dışı bırakın
      // Sync işlemi zaten loginWithBasketSync'de yapılıyor
      /*
      const token = getState().users.token;
      const currentUserId = getState().users.user?._id;
      
      if (token && currentUserId) {
        dispatch(loginAndSyncBasket(currentUserId, token));
      }
      */
      
      localStorage.removeItem("savedUserBasket");
    }
  } catch (err) {
    console.error("Kaydedilmiş sepet geri yüklenirken hata:", err);
  }
};

// In basketSlice.js, add a new action
export const removeFromBasketAPI =
  (productId) => async (dispatch, getState) => {
    try {
      dispatch(setLoading(true));

      const token = getState().users.token;

      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Delete from server
        await axios.delete(`${BASE_URL}/cart/items/${productId}`, config);

        // Then remove from local state
        dispatch(removeFromBasket(productId));
        dispatch(calculateBasket());
      } else {
        // If not logged in, just remove from local state
        dispatch(removeFromBasket(productId));
        dispatch(calculateBasket());
      }

      dispatch(setLoading(false));
    } catch (error) {
      console.error("Remove from basket error:", error);
      dispatch(setError("Ürün sepetten silinirken hata oluştu"));
      dispatch(setLoading(false));
    }
  };

// Similarly for clearing the basket
export const clearBasketAPI = () => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));

    const token = getState().users.token;

    if (token) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Clear on server
      await axios.delete(`${BASE_URL}/cart`, config);
    }

    // Clear local state
    dispatch(clearBasket());
    dispatch(calculateBasket());
    dispatch(setLoading(false));
  } catch (error) {
    console.error("Clear basket error:", error);
    dispatch(setError("Sepet temizlenirken hata oluştu"));
    dispatch(setLoading(false));
  }
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
  setBasketLoaded,
} = basketSlice.actions;

export default basketSlice.reducer;
