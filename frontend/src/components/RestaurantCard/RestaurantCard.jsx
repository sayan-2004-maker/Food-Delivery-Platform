import React from "react";
import { Link } from "react-router-dom";
import { normalizeCuisines } from "../../utils/normalizeCuisines";
import "./RestaurantCard.css";

const RestaurantCard = ({ restaurant, imageBaseUrl }) => {
  const cuisines = normalizeCuisines(restaurant.cuisines);

  return (
    <Link className="restaurant-card" to={`/restaurant/${restaurant._id}`}>
      <div className="restaurant-card-image-wrap">
        <img className="restaurant-card-image" src={`${imageBaseUrl}/images/${restaurant.image}`} alt={restaurant.name} />
        {restaurant.offerLabel && <span className="restaurant-offer">{restaurant.offerLabel}</span>}
        {!restaurant.isActive && <span className="restaurant-closed">Currently unavailable</span>}
      </div>
      <div className="restaurant-card-content">
        <div className="restaurant-card-title"><h3>{restaurant.name}</h3><span className="restaurant-time">{restaurant.deliveryTime ? `${restaurant.deliveryTime} min` : "Delivery time varies"}</span></div>
        <p className="restaurant-card-cuisines">{cuisines.join(" · ")}</p>
        <div className="restaurant-card-meta">
          <span>{restaurant.address?.city}{restaurant.address?.state ? `, ${restaurant.address.state}` : ""}</span>
          <span>₹{restaurant.averageCostForTwo || 0} for two</span>
        </div>
        <div className="restaurant-card-meta restaurant-card-footer">
          <span>{restaurant.foodCount ?? 0} menu items</span>
          <span>{Number(restaurant.deliveryFee) === 0 ? "Free delivery" : `₹${restaurant.deliveryFee} delivery`}</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
