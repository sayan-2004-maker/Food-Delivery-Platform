import React, { useContext } from "react";
import "./cart.css";
import { StoreContext } from "../../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {

    const {
        cartItems,
        food_list,
        removeFromCart,
        addToCart,
        getTotalCartAmount,
        getCartRestaurant
    } = useContext(StoreContext);

    const navigate = useNavigate();


    const subtotal = getTotalCartAmount();

    const deliveryFee = subtotal === 0 ? 0 : Number(getCartRestaurant()?.deliveryFee || 0);

    const total = subtotal + deliveryFee;


    return (
        <div className="cart">

            {/* ================= CART ITEMS ================= */}

            <div className="cart-items">

                <div className="cart-items-title">

                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                    <p>Remove</p>

                </div>

                <br />

                <hr />


                {food_list.map((item) => {

                    const quantity =
                        cartItems?.[item._id] || 0;


                    if (quantity === 0) {
                        return null;
                    }


                    return (

                        <div key={item._id}>

                            <div className="cart-items-title cart-items-item">

                                {/* IMAGE */}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                />


                                {/* NAME */}
                                <p>
                                    {item.name}
                                </p>


                                {/* PRICE */}
                                <p>
                                    ₹{item.price}
                                </p>


                                {/* QUANTITY */}
                                <div className="cart-quantity">
                                    <button onClick={() => removeFromCart(item._id)} aria-label={`Remove one ${item.name}`}>−</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => addToCart(item._id)} aria-label={`Add one ${item.name}`}>+</button>
                                </div>


                                {/* TOTAL */}
                                <p>
                                    ₹{item.price * quantity}
                                </p>


                                {/* REMOVE */}
                                <p
                                    onClick={() =>
                                        removeFromCart(item._id)
                                    }
                                    className="cross"
                                >
                                    ×
                                </p>

                            </div>

                            <hr />

                        </div>

                    );

                })}


                {/* EMPTY CART */}

                {Object.keys(cartItems || {}).length === 0 && (

                    <div
                        style={{
                            textAlign: "center",
                            padding: "50px 20px"
                        }}
                    >

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Add some delicious food to your cart!
                        </p>

                    </div>

                )}

            </div>


            {/* ================= BOTTOM ================= */}

            <div className="cart-bottom">


                {/* CART TOTAL */}

                <div className="cart-total">

                    <h2>
                        Cart Totals
                    </h2>


                    <div className="cart-total-details">

                        <p>
                            Subtotal
                        </p>

                        <p>
                            ₹{subtotal}
                        </p>

                    </div>

                    <hr />


                    <div className="cart-total-details">

                        <p>
                            Delivery Fee
                        </p>

                        <p>
                            ₹{deliveryFee}
                        </p>

                    </div>

                    <hr />


                    <div className="cart-total-details">

                        <b>
                            Total
                        </b>

                        <b>
                            ₹{total}
                        </b>

                    </div>


                    <button
                        disabled={subtotal === 0}
                        onClick={() => navigate("/order")}
                    >
                        PROCEED TO CHECKOUT
                    </button>

                </div>


                {/* PROMO CODE */}

                <div className="cart-promocode">

                    <div>

                        <p>
                            If you have a promo code,
                            Enter it here
                        </p>

                        <div className="cart-promocode-input">

                            <input
                                type="text"
                                placeholder="Promo code"
                            />

                            <button>
                                Submit
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Cart;