import React, { useCallback, useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const {
    getTotalCartAmount,
    getCartRestaurant,
    token,
    food_list,
    cartItems,
    url
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(true);
  const [formError, setFormError] = useState("");

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const { data: response } = await axios.get(`${url}/api/user/profile`, {
        headers: { token }
      });
      if (!response.success) {
        throw new Error(response.message || "Unable to load saved delivery details");
      }

      const profile = response.data;
      const address = profile.address || {};
      const nameParts = (profile.name || "").trim().split(/\s+/).filter(Boolean);
      const checkoutDetails = {
        firstName: address.firstName || nameParts[0] || "",
        lastName: address.lastName || nameParts.slice(1).join(" "),
        email: profile.email || address.email || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipcode: address.zipcode || "",
        country: address.country || "",
        phone: profile.phone || address.phone || ""
      };
      setData(checkoutDetails);
      const hasCompleteAddress = Object.values(checkoutDetails).every((value) => String(value).trim());
      setHasSavedAddress(hasCompleteAddress);
      setEditingAddress(!hasCompleteAddress);
    } catch (requestError) {
      setProfileError(requestError.response?.data?.message || requestError.message || "Unable to load saved delivery details");
    } finally {
      setProfileLoading(false);
    }
  }, [token, url]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormError("");

    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!token) {
      alert("Please login first");
      navigate("/cart");
      return;
    }

    const requiredDetails = ["firstName", "lastName", "email", "street", "city", "state", "zipcode", "country", "phone"];
    if (requiredDetails.some((field) => !String(data[field] || "").trim())) {
      setFormError("Please complete all delivery details before continuing.");
      setEditingAddress(true);
      return;
    }

    let orderItems = [];

    food_list.forEach((item) => {
      const quantity = cartItems?.[item._id] || 0;

      if (quantity > 0) {
        orderItems.push({
          ...item,
          quantity
        });
      }
    });

    if (orderItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    const subtotal = getTotalCartAmount();
    const deliveryFee = Number(getCartRestaurant()?.deliveryFee || 0);
    const totalAmount = subtotal + deliveryFee;

    const orderData = {
      address: data,
      items: orderItems,
      amount: totalAmount
    };

    try {
      const response = await axios.post(
        `${url}/api/order/place`,
        orderData,
        {
          headers: {
            token: token
          }
        }
      );

      if (response.data.success) {
        if (response.data.session_url) {
          window.location.replace(response.data.session_url);
        } else {
          alert("Order created, but Stripe session URL is missing.");
        }
      } else {
        alert(
          response.data.message ||
          "Error placing order"
        );
      }

    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error placing order";

      alert(backendMessage);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/cart");
      return;
    }

    if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  useEffect(() => {
    if (token) loadProfile();
  }, [token, loadProfile]);

  return (
    <form onSubmit={placeOrder} className="Place-order">

      <div className="Place-order-left">
        <p className="Title">Delivery Information</p>
        <p className="place-order-saved-note">
          {profileLoading
            ? "Loading your saved details…"
            : hasSavedAddress && !editingAddress
              ? "Your saved address is selected for this order."
              : profileError
              ? "Enter your delivery details. They’ll be saved to your account when you place an order."
              : hasSavedAddress
                ? "Review or update your saved delivery address."
                : "Add your delivery details. They’ll be saved to your account for next time."}
        </p>
        {profileError && <p className="place-order-profile-error" role="status">{profileError} You can still enter your details below.</p>}

        {formError && <p className="place-order-profile-error" role="alert">{formError}</p>}

        {hasSavedAddress && !editingAddress ? (
          <section className="saved-delivery-address" aria-label="Selected delivery address">
            <div className="saved-address-heading">
              <span className="saved-address-check" aria-hidden="true">✓</span>
              <strong>Delivering to this address</strong>
              <button type="button" onClick={() => setEditingAddress(true)}>Change</button>
            </div>
            <p className="saved-address-name">{data.firstName} {data.lastName}</p>
            <p>{data.street}</p>
            <p>{[data.city, data.state, data.zipcode].filter(Boolean).join(", ")}</p>
            <p>{data.country}</p>
            <p className="saved-address-contact">{data.phone} · {data.email}</p>
          </section>
        ) : (
          <>
            <div className="multi-fields">
              <input required name="firstName" onChange={onChangeHandler} value={data.firstName} type="text" placeholder="First name" autoComplete="given-name" />
              <input required name="lastName" onChange={onChangeHandler} value={data.lastName} type="text" placeholder="Last name" autoComplete="family-name" />
            </div>

            <label className="place-order-field">
              Email address
              <input required name="email" onChange={onChangeHandler} value={data.email} type="email" placeholder="Email address" autoComplete="email" />
            </label>

            <label className="place-order-field">
              Street address
              <input required name="street" onChange={onChangeHandler} value={data.street} type="text" placeholder="Street" autoComplete="street-address" />
            </label>

            <div className="multi-fields">
              <input required name="city" onChange={onChangeHandler} value={data.city} type="text" placeholder="City" autoComplete="address-level2" />
              <input required name="state" onChange={onChangeHandler} value={data.state} type="text" placeholder="State" autoComplete="address-level1" />
            </div>

            <div className="multi-fields">
              <input required name="zipcode" onChange={onChangeHandler} value={data.zipcode} type="text" placeholder="Zip code" autoComplete="postal-code" />
              <input required name="country" onChange={onChangeHandler} value={data.country} type="text" placeholder="Country" autoComplete="country-name" />
            </div>

            <input required name="phone" onChange={onChangeHandler} value={data.phone} type="tel" placeholder="Phone number" autoComplete="tel" />
            {hasSavedAddress && (
              <button
                className="place-order-use-address"
                type="button"
                onClick={() => {
                  const requiredDetails = ["firstName", "lastName", "email", "street", "city", "state", "zipcode", "country", "phone"];
                  if (requiredDetails.some((field) => !String(data[field] || "").trim())) {
                    setFormError("Complete all delivery details to use this address.");
                    return;
                  }
                  setFormError("");
                  setEditingAddress(false);
                }}
              >
                Use this address
              </button>
            )}
          </>
        )}
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : Number(getCartRestaurant()?.deliveryFee || 0)}</p>
          </div>

          <hr />

          <div className="cart-total-details">
            <b>Total</b>
            <b>
              ₹
              {getTotalCartAmount() === 0
                ? 0
                : getTotalCartAmount() + Number(getCartRestaurant()?.deliveryFee || 0)}
            </b>
          </div>

          <button type="submit" disabled={profileLoading}>
            {profileLoading ? "LOADING DETAILS..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>

    </form>
  );
};

export default PlaceOrder;