import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="info-page">

      <div className="info-hero">
        <h1>About Us</h1>
        <p>
          Fresh food, great taste, and convenient delivery at your doorstep.
        </p>
      </div>

      <div className="info-container">

        <section className="info-card">
          <h2>Who We Are</h2>
          <p>
            Welcome to our Food Delivery App. We make it simple to discover
            delicious food and order your favorite meals from the comfort of
            your home.
          </p>
        </section>

        <section className="info-card">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make food ordering simple, convenient, and
            enjoyable. We connect customers with delicious meals while
            providing a smooth ordering experience.
          </p>
        </section>

        <section className="info-features">

          <div className="info-feature">
            <div className="info-feature-icon">🍕</div>
            <h3>Delicious Food</h3>
            <p>Enjoy a wide variety of tasty meals.</p>
          </div>

          <div className="info-feature">
            <div className="info-feature-icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Get your food delivered conveniently.</p>
          </div>

          <div className="info-feature">
            <div className="info-feature-icon">❤️</div>
            <h3>Customer First</h3>
            <p>Your satisfaction is important to us.</p>
          </div>

        </section>

      </div>

    </div>
  );
};

export default About;