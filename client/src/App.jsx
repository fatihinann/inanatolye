import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchBasket, loginAndSyncBasket, restoreUserBasket } from "./redux/slices/basketSlice";
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
    // Kullanıcının oturum açıp açmadığını kontrol et
    const token = localStorage.getItem("token");
    
    // Misafir sepetini sadece bir kez çek ve saklayın
    const guestBasket = JSON.parse(localStorage.getItem("basket") || "[]");
    let guestBasketProcessed = false;
    
    if (token) {
      // Token'ı doğrula ve kullanıcıyı al
      dispatch(validateToken(token)).then((isValid) => {
        if (isValid) {
          // Sadece misafir sepeti varsa ve işlenmemişse senkronize et
          if (guestBasket.length > 0 && !guestBasketProcessed) {
            dispatch(loginAndSyncBasket(token));
            guestBasketProcessed = true;
          } else {
            // Aksi halde sadece kullanıcı sepetini yükle
            dispatch(fetchBasket());
          }
        } else {
          // Token geçersiz, misafir sepetini yükle
          dispatch(restoreUserBasket());
        }
      });
    } else {
      // Token yok, misafir sepetini yükle
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
