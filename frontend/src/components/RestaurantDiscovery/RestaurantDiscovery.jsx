import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { food_list as categoryImages } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import RestaurantCard from "../RestaurantCard/RestaurantCard";
import "./RestaurantDiscovery.css";

const RestaurantDiscovery = () => {
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [savedAddressLabel, setSavedAddressLabel] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(Boolean(token));
  const [restaurantsError, setRestaurantsError] = useState("");

  useEffect(() => {
    let active = true;

    if (token) {
      axios.get(`${url}/api/user/profile`, { headers: { token } })
        .then(async ({ data }) => {
          if (!data.success) {
            throw new Error(data.message || "Unable to load your saved delivery address");
          }
          const address = data.data.address || {};
          const accountLocation = address.zipcode || address.city || "";
          const accountAddressLabel = [
            address.street,
            address.city,
            address.state,
            address.zipcode,
            address.country
          ].filter(Boolean).join(", ");
          if (!active) return;
          if (!accountLocation) {
            setRestaurantsLoading(false);
            return;
          }
          setSavedLocation(accountLocation);
          setSavedAddressLabel(accountAddressLabel || accountLocation);
          setCity(accountAddressLabel || accountLocation);

          const restaurantResponse = await axios.get(`${url}/api/restaurants/list`, {
            params: { location: accountLocation, limit: 8 }
          });
          if (!restaurantResponse.data.success) {
            throw new Error(restaurantResponse.data.message || "Unable to load restaurants for your saved address");
          }
          if (active) {
            setRestaurants(restaurantResponse.data.data || []);
          }
        })
        .catch((error) => {
          if (active) {
            setRestaurantsError(
              error.response?.data?.message ||
              error.message ||
              "Unable to load restaurants for your saved address"
            );
          }
        })
        .finally(() => {
          if (active) setRestaurantsLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [token, url]);

  const search = (event) => {
    event.preventDefault();
    const enteredLocation = city.trim();
    const location = enteredLocation === savedAddressLabel ? savedLocation : enteredLocation;
    if (!location) return;
    navigate(`/restaurants?location=${encodeURIComponent(location)}`);
  };

  return (
    <main className="discovery-page">
      <section className="discovery-hero">
        <div className="discovery-hero-content">
          <span className="discovery-kicker">YOUR NEIGHBOURHOOD, SERVED</span>
          <h1>Good food.<br />Great days.</h1>
          <p>Discover local restaurants and have your favourites delivered straight to your door.</p>
          <form className="discovery-search" onSubmit={search}>
            <label className="discovery-location"><span aria-hidden="true">⌖</span><input aria-label="City or PIN code" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Enter your city or PIN code" required /></label>
            <button type="submit">Find restaurants</button>
          </form>
          <div className="discovery-hero-note">
            <span aria-hidden="true">●</span>
            {savedAddressLabel
              ? "Restaurants shown for your saved delivery location"
              : "Enter your city or PIN code to check delivery"}
          </div>
        </div>
        <div className="discovery-hero-art">
          <img src={categoryImages[22].image} alt="Freshly prepared salad with greens and tomatoes" />
          <div className="discovery-art-tag"><span>Fresh picks</span><strong>Made for your cravings</strong></div>
        </div>
      </section>

      {token && (savedLocation || restaurantsLoading || restaurantsError) && (
        <section className="discovery-section" aria-live="polite">
          <div className="discovery-section-heading">
            <div>
              <span className="discovery-kicker">DELIVERING TO YOUR SAVED ADDRESS</span>
              <h2>Restaurants near you</h2>
              <p>Based on your saved delivery location.</p>
            </div>
            {savedLocation && restaurants.length > 0 && (
              <button type="button" onClick={() => navigate(`/restaurants?location=${encodeURIComponent(savedLocation)}`)}>
                See all restaurants <span aria-hidden="true">›</span>
              </button>
            )}
          </div>
          {restaurantsLoading && <div className="discovery-message" role="status">Finding restaurants for your saved address…</div>}
          {!restaurantsLoading && restaurantsError && (
            <div className="discovery-message" role="alert">
              {restaurantsError} You can still search your location above.
            </div>
          )}
          {!restaurantsLoading && !restaurantsError && savedLocation && restaurants.length === 0 && (
            <div className="discovery-message" role="status">
              We’re currently not serving in {savedLocation}. We’ll be back soon.
            </div>
          )}
          {!restaurantsLoading && !restaurantsError && restaurants.length > 0 && (
            <div className="discovery-grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} imageBaseUrl={url} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default RestaurantDiscovery;
