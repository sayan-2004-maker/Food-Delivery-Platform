import React, { useState, useContext } from "react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Route, Routes } from "react-router-dom";

import About from "./pages/About/About";
import Delivery from "./pages/Delivery/Delivery";
import Privacy from "./pages/Privacy/Privacy";

import Home from "./pages/Home/Home";
import Cart from "./pages/Home/cart/cart";
import Order from "./pages/Home/cart/place_Order/PlaceOrder";
import Verify from "./pages/verify/verify";
import LoginPopup from "./components/LoginPopup/LoginPopup";
import { StoreContext } from "./context/StoreContext";
import MyOrders from "./pages/MyOrders/MyOrders";
import Restaurants from "./pages/Restaurants/Restaurants";
import Restaurant from "./pages/Restaurant/Restaurant";

const App = () => {

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { token } = useContext(StoreContext);

  return (
    <>
      {showLoginPopup && (
        <LoginPopup
          setShowLoginPopup={setShowLoginPopup}
        />
      )}

      <div className="App" key={token}>

        <Navbar
          setShowLoginPopup={setShowLoginPopup}
        />

        <Routes>

          {/* Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Cart */}
          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* Place Order */}
          <Route
            path="/order"
            element={<Order />}
          />

          {/* Verify */}
          <Route
            path="/verify"
            element={<Verify />}
          />

          {/* My Orders */}
          <Route
            path="/myorders"
            element={<MyOrders />}
          />

          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurant/:id" element={<Restaurant />} />

          {/* Add */}
          <Route
            path="/add"
            element={<Home />}
          />

          {/* About Us */}
          <Route
            path="/about"
            element={<About />}
          />

          {/* Delivery */}
          <Route
            path="/delivery"
            element={<Delivery />}
          />

          {/* Privacy Policy */}
          <Route
            path="/privacy"
            element={<Privacy />}
          />

          {/* Any unknown URL */}
          <Route
            path="*"
            element={<Home />}
          />

        </Routes>

      </div>

      <Footer />
    </>
  );
};

export default App;