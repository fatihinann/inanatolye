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
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBasket} from "./redux/slices/basketSlice";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated ?? false);

  useEffect(() => {
    dispatch(fetchBasket());
  }, [dispatch, isAuthenticated]);

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
