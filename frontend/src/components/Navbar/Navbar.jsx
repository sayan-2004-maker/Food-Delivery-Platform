import React, { useContext } from 'react';
import './Navbar.css';
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext.jsx";

const Navbar = ({ setShowLoginPopup }) => {
  const { getCartItemCount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Foodyra home">
          <span className="navbar-wordmark">foodyra<span>.</span></span>
        </Link>

        <nav className="navbar-menu" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/delivery">Delivery</Link>
        </nav>

        <div className="navbar-right">
          <Link className="navbar-search-link" to="/restaurants" aria-label="Search restaurants">
            <img src={assets.search_icon} alt="" />
            <span>Search</span>
          </Link>
          <Link className="navbar-cart-link" to="/cart" aria-label={`Cart, ${getCartItemCount()} items`}>
            <img src={assets.basket_icon} alt="" />
            <span className="navbar-cart-label">Cart</span>
            {getCartItemCount() > 0 && <span className="navbar-cart-count">{getCartItemCount()}</span>}
          </Link>

          {!token ? (
            <button className="navbar-sign-in" onClick={() => setShowLoginPopup(true)}>Sign in</button>
          ) : (
            <div className="navbar-profile">
              <button className="navbar-profile-trigger" aria-label="Open account menu">
                <img src={assets.profile_icon} alt="" />
                <span>Account</span>
              </button>
              <ul className="navbar-profile-dropdown">
                <li><button onClick={() => navigate("/myorders")}><img src={assets.bag_icon} alt="" />Orders</button></li>
                <li><button onClick={logout}><img src={assets.logout_icon} alt="" />Sign out</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;