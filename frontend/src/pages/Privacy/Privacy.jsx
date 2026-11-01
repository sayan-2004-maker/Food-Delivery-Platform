import React from "react";
import "./Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-page">

      <div className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p>
          Your privacy and security are important to us.
        </p>
      </div>

      <div className="privacy-container">

        <div className="privacy-card">

          <h2>Information We Collect</h2>
          <p>
            When you use our food delivery service, we may collect
            information needed to provide our services, such as your
            account details, contact information, and order information.
          </p>

        </div>

        <div className="privacy-card">

          <h2>How We Use Your Information</h2>
          <p>
            Your information may be used to process orders, provide
            customer support, improve our services, and communicate
            important information about your account or orders.
          </p>

        </div>

        <div className="privacy-card">

          <h2>Account Security</h2>
          <p>
            We take reasonable steps to protect your account information.
            You should also keep your login credentials private and
            avoid sharing your password with others.
          </p>

        </div>

        <div className="privacy-card">

          <h2>Cookies</h2>
          <p>
            Our website may use cookies or similar technologies to
            provide a better user experience and remember certain
            preferences.
          </p>

        </div>

        <div className="privacy-card">

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy when our services or
            practices change. Any updated policy will be displayed
            on this page.
          </p>

        </div>

        <div className="privacy-contact">
          <h2>Questions?</h2>
          <p>
            If you have questions about this Privacy Policy, please
            contact us through the contact information provided on
            our website.
          </p>
        </div>

      </div>

    </div>
  );
};

export default Privacy;