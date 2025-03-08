import { React, useEffect, useState } from "react";
import { FaCartShopping } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { CiLight } from "react-icons/ci";
import { MdModeNight } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Badge } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { clearBasket, setDrawerClose } from "../redux/slices/basketSlice";
import { setSearchQuery } from "../redux/slices/productSlice";
import "../css/header.scss";
import "../css/user.scss";
import { logoutUser } from "../redux/slices/userSlice";
// import { logoutWithBasketSave } from "../redux/slices/userSlice";

function Header() {
  const [theme, setTheme] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { products } = useSelector((store) => store.basket);
  const query = useSelector((state) => state.product.query);
  const { currentUser, isAuthenticated } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser()); // Use the correct action from userSlice
    dispatch(clearBasket());
    navigate("/");
  };

  const changeTheme = () => {
    const root = document.getElementById("root");
    if (theme) {
      root.style.backgroundColor = "#fafafa";
      root.style.color = "#222";
    } else {
      root.style.backgroundColor = "#222";
      root.style.color = "#fafafa";
    }
    setTheme(!theme);
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
    console.log("Arama sorgusu:", e.target.value);
  };
  return (
    <header>
      <div className="header-container">
        <div className="logo">
          <h1 onClick={() => navigate("/")}>İnan Crafts</h1>
        </div>
        <div className="menu">
          <div className="input-container">
            <span className="search-icon">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Ürün Ara..."
              value={query}
              onChange={handleSearchChange}
            />
          </div>

          <div className="icons">
            <span
              className="user"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <FaUser />
              Hesabım
              {isUserMenuOpen && !isAuthenticated ? (
                <ul>
                  <li onClick={() => navigate("/login")}>Giriş Yap</li>
                  <li onClick={() => navigate("/register")}>Kayıt Ol</li>
                </ul>
              ) : isUserMenuOpen && isAuthenticated ? (
                <ul>
                  <li>{currentUser?.name || "Kullanıcı"}</li>
                  <li onClick={() => navigate("/orders")}>Siparişlerim</li>
                  <li onClick={() => navigate("/profile")}>
                    Kullanıcı Bilgilerim
                  </li>
                  <li onClick={() => navigate("/reviews")}>
                    Değerlendirmelerim
                  </li>
                  <li onClick={() => navigate("/favorites")}>Beğendiklerim</li>
                  <li onClick={handleLogout}>Çıkış Yap</li>
                </ul>
              ) : null}
            </span>
            <Badge color="info" badgeContent={products.length} showZero>
              <FaCartShopping
                onClick={() => {
                  dispatch(setDrawerClose());
                  navigate("/cart");
                }}
              />
            </Badge>
            <span onClick={changeTheme}>
              {theme ? <MdModeNight /> : <CiLight />}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
