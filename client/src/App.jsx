import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchBasket, restoreUserBasket } from "./redux/slices/basketSlice";
import { validateToken } from "./redux/slices/userSlice";

import "./App.scss";
import PageContainer from "./container/PageContainer";
import Header from "./components/Header";
import RouterConfig from "./config/RouterConfig";
import Loading from "./components/Loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./css/cart.scss";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Validate token and get user
      dispatch(validateToken(token)).then((isValid) => {
        if (isValid) {
          // Load the user's cart
          dispatch(fetchBasket());
        } else {
          // Token is invalid, load guest basket
          dispatch(restoreUserBasket());
        }
      });
    } else {
      // No token, load guest basket
      dispatch(fetchBasket());
    }
  }, [dispatch]);

  return (
    <div className="app">
      <Header />
      <PageContainer maxWidth="lg" className="app-content">
        <RouterConfig />
      </PageContainer>

      <CartDrawer />
      <Footer />
      <div className="load-and-toast">
        <ToastContainer />
        <Loading />
      </div>
    </div>
  );
}

export default App;