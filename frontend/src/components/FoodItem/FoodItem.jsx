import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({
    id,
    name,
    price,
    description,
    image
}) => {

    const {
        cartItems,
        addToCart,
        removeFromCart
    } = useContext(StoreContext);


    const quantity = cartItems?.[id] || 0;


    return (
        <div className="food-item">

            <div className="food-item-img-container">

                {/* FOOD IMAGE */}
                <img
                    className="food-item-image"
                    src={image}
                    alt={name}
                />


                {/* ADD BUTTON */}
                {quantity === 0 ? (

                    <img
                        className="add"
                        onClick={() => addToCart(id)}
                        src={assets.add_icon_white}
                        alt="Add"
                    />

                ) : (

                    /* CART COUNTER */
                    <div className="food-item-counter">

                        <img
                            onClick={() => removeFromCart(id)}
                            src={assets.remove_icon_red}
                            alt="Remove"
                        />

                        <p>
                            {quantity}
                        </p>

                        <img
                            onClick={() => addToCart(id)}
                            src={assets.add_icon_green}
                            alt="Add"
                        />

                    </div>

                )}

            </div>


            {/* FOOD INFORMATION */}
            <div className="food-item-info">

                <div className="food-item-name-rating">

                    <p>
                        {name}
                    </p>

                    <img
                        src={assets.rating_starts}
                        alt="Rating"
                    />

                </div>


                <p className="food-item-desc">
                    {description}
                </p>


                <p className="food-item-price">
                    ₹ {price}
                </p>

            </div>

        </div>
    );
};

export default FoodItem;