import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
    setBasket: (state, action) => {
      state.products = action.payload;
      writeFromBasketToStorage(action.payload);
    },
    addToBasket: (state, action) => {
      const { id, count, maxQuantity, price } = action.payload;
      const product = state.products.find((p) => p.id === id);

      if (product) {
        const totalCount = product.count + count;

        if (totalCount > maxQuantity) {
          return;
        }

        const unitPrice = price;

        product.count = totalCount;
        product.price = unitPrice * totalCount;
      } else {
        if (count > maxQuantity) {
          return;
        }
        state.products.push({
          ...action.payload,
          price: action.payload.price * count,
          unitPrice: action.payload.price,
        });
      }

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
        (total, product) => total + product.price,
        0
      );
    },
    updateProductCount: (state, action) => {
      const { id, count } = action.payload;
      const product = state.products.find((p) => p.id === id);

      if (product) {
        const unitPrice = product.unitPrice || product.price / product.count;

        product.count = count;
        product.price = unitPrice * count;
      }

      writeFromBasketToStorage(state.products);
    },
    removeFromBasket: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload.id
      );
      writeFromBasketToStorage(state.products);
    },
    clearBasket: (state) => {
      state.products = [];
      writeFromBasketToStorage(state.products);
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
    saveBasketBeforeLogout: (state) => {
      // Çıkış yapmadan önce mevcut sepeti userBasket olarak kaydet
      localStorage.setItem("userBasket", JSON.stringify(state.products));
    },
    restoreUserBasket: (state) => {
      // Giriş yapıldığında userBasket varsa geri yükle
      const savedUserBasket = localStorage.getItem("userBasket");
      if (savedUserBasket) {
        const parsedBasket = JSON.parse(savedUserBasket);
        if (parsedBasket.length > 0 && state.products.length === 0) {
          state.products = parsedBasket;
          writeFromBasketToStorage(parsedBasket);
        }
        // Geri yüklendikten sonra localStorage'dan temizle
        localStorage.removeItem("userBasket");
      }
    }
  },
});

// Async Thunks
export const loginAndSyncBasket = (userId) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    
    // Önce mevcut sepeti al (misafir sepeti)
    const guestBasket = getBasketFromStorage();
    
    // Kullanıcı ID'sini güncelle
    dispatch(setUserId(userId));
    
    // Kullanıcının mevcut sepetini getir
    const response = await axios.get(`/api/basket/${userId}`);
    const userBasket = response.data;
    
    // Sepetleri birleştir
    const mergedBasket = mergeBaskets(guestBasket, userBasket);
    
    // Birleştirilmiş sepeti API'ye gönder
    await axios.post(`/api/basket/${userId}/sync`, { items: mergedBasket });
    
    // Giriş yapmış kullanıcının kayıtlı sepetini kontrol et ve geri yükle
    dispatch(restoreUserBasket());
    
    // Store'u güncelle
    dispatch(setBasket(mergedBasket));
    dispatch(calculateBasket());
    dispatch(setLoading(false));
  } catch (err) {
    dispatch(setError("Sepet senkronizasyon hatası"));
    dispatch(setLoading(false));
    console.error("Login ve sepet senkronizasyon hatası:", err);
  }
};

export const prepareLogout = () => async (dispatch) => {
  // Çıkış yapmadan önce mevcut sepeti kaydet
  dispatch(saveBasketBeforeLogout());
};

export const logout = () => async (dispatch) => {
  // Önce mevcut sepeti kaydet, sonra sepeti temizle
  dispatch(prepareLogout());
  dispatch(clearBasket());
  dispatch(setUserId(null));
};

export const syncBasket = (items) => async (dispatch, getState) => {
  try {
    const { userId } = getState().basket;
    if (userId) {
      await axios.post(`/api/basket/${userId}/sync`, { items });
    }
    dispatch(fetchBasket());
  } catch (err) {
    console.error("Sepet senkronizasyon hatası:", err);
  }
};

export const fetchBasket = () => async (dispatch, getState) => {
  try {
    const { userId } = getState().basket;
    if (userId) {
      const response = await axios.get(`/api/basket/${userId}`);
      dispatch(setBasket(response.data));
    } else {
      const guestBasket = getBasketFromStorage();
      dispatch(setBasket(guestBasket));
    }
  } catch (err) {
    console.error("Sepet alınamadı:", err);
  }
};

// Helper function to merge baskets
const mergeBaskets = (guestBasket, userBasket) => {
  const mergedBasket = [...userBasket];

  guestBasket.forEach((guestItem) => {
    const existingItem = mergedBasket.find((item) => item.id === guestItem.id);
    if (existingItem) {
      // Toplam miktar maxQuantity'i geçmeyecek şekilde birleştir
      const newCount = Math.min(
        existingItem.count + guestItem.count,
        guestItem.maxQuantity
      );
      existingItem.count = newCount;
      existingItem.price = existingItem.unitPrice * newCount;
    } else {
      mergedBasket.push(guestItem);
    }
  });

  return mergedBasket;
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