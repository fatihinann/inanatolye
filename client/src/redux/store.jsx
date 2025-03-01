import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../redux/slices/appSlice";
import productReducer from "../redux/slices/productSlice";
import basketReducer from "./slices/basketSlice";
import usersReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    product: productReducer,
    basket: basketReducer,
    users: usersReducer,
  },
});
