import React from "react";
import "./Delivery.css";

const Delivery = () => {
  return (
    <div className="delivery-page">

      <div className="delivery-hero">
        <h1>Delivery</h1>
        <p>
          Simple, convenient, and reliable food delivery.
        </p>
      </div>

      <div className="delivery-container">

        <h2>How It Works</h2>

        <div className="delivery-steps">

          <div className="delivery-step">
            <div className="delivery-number">1</div>
            <h3>Choose Your Food</h3>
            <p>
              Browse our menu and select the dishes you want to enjoy.
            </p>
          </div>

          <div className="delivery-step">
            <div className="delivery-number">2</div>
            <h3>Place Your Order</h3>
            <p>
              Add your favorite items to your cart and place your order.
            </p>
          </div>

          <div className="delivery-step">
            <div className="delivery-number">3</div>
            <h3>We Prepare It</h3>
            <p>
              Your order is prepared with care and packed for delivery.
            </p>
          </div>

          <div className="delivery-step">
            <div className="delivery-number">4</div>
            <h3>Enjoy Your Meal</h3>
            <p>
              Your food arrives at your doorstep, ready to enjoy.
            </p>
          </div>

        </div>

        <div className="delivery-info">

          <div>
            <h2>Fresh & Convenient</h2>
            <p>
              We aim to make ordering food as convenient as possible.
              Choose your favorite dishes, place your order, and enjoy
              your meal without leaving home.
            </p>
          </div>

          <div>
            <h2>Need Help?</h2>
            <p>
              If you have questions about your order or delivery,
              please contact our support team.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Delivery;