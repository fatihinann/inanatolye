import { createSlice } from "@reduxjs/toolkit";
import { logout, loginAndSyncBasket } from "./basketSlice";

// LocalStorage'dan mevcut kullanıcıyı alma
const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

const initialState = {
  users: localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")) : [],
  currentUser: getCurrentUserFromStorage(),
  isAuthenticated: !!getCurrentUserFromStorage(),
  error: null, // 'message' yerine 'error' kullan
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    registerUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: Date.now().toString() // Unique ID ekleme
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
        state.error = "Geçersiz kimlik bilgileri!"; // Redux'ta 'message' yerine 'error' kullan
        return;
      }
    
      state.currentUser = user;
      state.isAuthenticated = true;
      state.error = null; // Giriş başarılıysa hatayı temizle
      localStorage.setItem("currentUser", JSON.stringify(user));
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      localStorage.removeItem("currentUser");
    },
    
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    
    updateUser: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex(u => u.id === updatedUser.id);
      
      if(index === -1) throw new Error("Kullanıcı bulunamadı!");
      
      // Güncelleme işlemleri
      state.users[index] = updatedUser;
      localStorage.setItem("users", JSON.stringify(state.users));

      // Eğer güncellenen kullanıcı mevcut kullanıcıysa
      if(state.currentUser?.id === updatedUser.id) {
        state.currentUser = updatedUser;
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      }
    },
    
    deleteUser: (state, action) => {
      const userId = action.payload;
      state.users = state.users.filter(u => u.id !== userId);
      localStorage.setItem("users", JSON.stringify(state.users));

      // Eğer silinen kullanıcı mevcut kullanıcıysa
      if(state.currentUser?.id === userId) {
        state.currentUser = null;
        state.isAuthenticated = false;
        localStorage.removeItem("currentUser");
      }
    }
  }
});

// Thunk Actions
export const loginWithBasketSync = (credentials) => async (dispatch, getState) => {
  try {
    console.log("Giriş bilgileri:", credentials); // Gelen bilgileri kontrol et
    console.log("Mevcut kullanıcılar:", getState().users.users); // Kullanıcı listesini kontrol et
    
    // Login işlemini başlat
    await dispatch(loginUser(credentials));
    
    // Güncellenmiş state'i al
    const currentState = getState();
    console.log("Login sonrası state:", currentState.users);
    
    if (currentState.users.error) {
      console.log("Login hatası:", currentState.users.error);
      return Promise.reject(currentState.users.error);
    }
    
    // Giriş başarılıysa, sepeti senkronize et
    if (currentState.users.currentUser) {
      await dispatch(loginAndSyncBasket(currentState.users.currentUser.id));
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Login thunk hatası:", error);
    return Promise.reject(error.message || "Bir hata oluştu");
  }
};

export const logoutWithBasketSave = () => async (dispatch) => {
  // Önce sepet ile ilgili işlemleri yap
  await dispatch(logout());
  
  // Sonra kullanıcı çıkışını yap
  dispatch(logoutUser());
};

export const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  loginSuccess,
  logoutSuccess
} = usersSlice.actions;

export default usersSlice.reducer;