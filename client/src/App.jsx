import { useEffect,  } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBasket,
  loginAndSyncBasket,
  restoreUserBasket,
} from "./redux/slices/basketSlice";
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
  const basketLoaded = useSelector((state) => state.basket.basketLoaded);

  useEffect(() => {
    // Kullanıcının oturum açıp açmadığını kontrol et
    const token = localStorage.getItem("token");
    
    // Misafir sepetini sadece bir kez çek
    const guestBasket = JSON.parse(localStorage.getItem("basket") || "[]");
    
    if (!basketLoaded) {
      if (token) {
        // Validate token and get user
        dispatch(validateToken(token)).then((isValid) => {
          if (isValid) {
            // Sync if guest basket exists, otherwise just fetch
            if (guestBasket.length > 0) {
              dispatch(loginAndSyncBasket(token));
            } else {
              dispatch(fetchBasket());
            }
          } else {
            // Invalid token, load guest basket
            dispatch(restoreUserBasket());
          }
        });
      } else {
        // No token, load guest basket
        dispatch(fetchBasket());
      }
    }
  }, [dispatch, basketLoaded]);

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
