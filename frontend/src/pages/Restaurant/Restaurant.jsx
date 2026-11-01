import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import "./Restaurant.css";

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { url, cartItems, addToCart, removeFromCart, getCartItemCount, getTotalCartAmount } = useContext(StoreContext);
  const [restaurantState, setRestaurantState] = useState({ id: "", restaurant: null, error: "" });
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    let active = true;
    axios.get(`${url}/api/restaurants/${id}`)
      .then(({ data }) => {
        if (!data.success) throw new Error(data.message || "Unable to load restaurant");
        if (active) setRestaurantState({ id, restaurant: data.data, error: "" });
      })
      .catch((requestError) => {
        if (active) setRestaurantState({ id, restaurant: null, error: requestError.response?.data?.message || requestError.message || "Unable to load restaurant" });
      });
    return () => { active = false; };
  }, [url, id]);

  const loading = restaurantState.id !== id;
  const restaurant = loading ? null : restaurantState.restaurant;
  const error = loading ? "" : restaurantState.error;
  const categories = useMemo(() => ["All", ...new Set((restaurant?.foods || []).map((food) => food.category))], [restaurant]);
  const foods = useMemo(() => (restaurant?.foods || []).filter((food) =>
    (!query || `${food.name} ${food.description}`.toLowerCase().includes(query.toLowerCase())) &&
    (activeCategory === "All" || food.category === activeCategory)
  ), [restaurant, query, activeCategory]);
  const image = (filename) => filename?.startsWith("http") ? filename : `${url}/images/${filename}`;

  if (loading) return <main className="restaurant-detail-state">Loading restaurant menu…</main>;
  if (error || !restaurant) return <main className="restaurant-detail-state"><h2>Restaurant unavailable</h2><p>{error || "Restaurant not found"}</p><button onClick={() => navigate("/restaurants")}>Browse restaurants</button></main>;

  return (
    <main className="restaurant-detail-page">
      <button className="restaurant-back-link" onClick={() => navigate("/restaurants")}>← All restaurants</button>
      <section className="restaurant-detail-hero">
        <img src={image(restaurant.image)} alt={restaurant.name} />
        <div className="restaurant-detail-overlay">
          <span className="discovery-kicker">FOODYRA RESTAURANT</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.cuisines.join(" · ")}</p>
          <div className="restaurant-detail-meta"><span>{restaurant.address.street}, {restaurant.address.city}, {restaurant.address.state}</span><span>{restaurant.deliveryTime} min delivery</span><span>{restaurant.deliveryFee === 0 ? "Free delivery" : `₹${restaurant.deliveryFee} delivery`}</span></div>
          {restaurant.openingHours && <small>Hours: {restaurant.openingHours}</small>}
        </div>
      </section>
      <section className="restaurant-menu">
        <div className="restaurant-menu-heading"><div><span className="discovery-kicker">MADE FRESH FOR YOU</span><h2>Explore the menu</h2><p>{restaurant.description}</p></div><label className="restaurant-menu-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this menu" /></label></div>
        <nav className="restaurant-menu-categories" aria-label="Menu categories">{categories.map((category) => <button className={category === activeCategory ? "selected" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</nav>
        {foods.length === 0 && <p className="restaurant-menu-empty">No menu items match this selection yet.</p>}
        <div className="restaurant-menu-grid">{foods.map((food) => (
          <article className="restaurant-food-item" key={food._id}>
            <div className="restaurant-food-info"><span className="restaurant-food-category">{food.category}</span><h3>{food.name}</h3><p>{food.description}</p><strong>₹{food.price}</strong></div>
            <div className="restaurant-food-image-wrap"><img src={image(food.image)} alt={food.name} /><div className="restaurant-food-add">
              {cartItems?.[food._id] ? <div className="restaurant-food-counter"><button onClick={() => removeFromCart(food._id)} aria-label={`Remove one ${food.name}`}>−</button><span>{cartItems[food._id]}</span><button onClick={() => addToCart(food._id)} aria-label={`Add one ${food.name}`}>+</button></div> : <button onClick={() => addToCart(food._id)}>ADD</button>}
            </div></div>
          </article>
        ))}</div>
      </section>
      {getCartItemCount() > 0 && <button className="restaurant-view-cart" onClick={() => navigate("/cart")}>View cart · {getCartItemCount()} item{getCartItemCount() === 1 ? "" : "s"} · ₹{getTotalCartAmount()}</button>}
    </main>
  );
};

export default Restaurant;
