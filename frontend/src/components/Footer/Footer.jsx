import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='footer' id='footer'>

      <div className="footer-content">

        <div className="footer-content-left">

          <Link to="/">
            <span className="footer-wordmark">foodyra<span>.</span></span>
          </Link>

          <p>
            Find your neighbourhood favourites and enjoy them at home.
          </p>

          <div className="footer-social-icons">

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.twitter_icon} alt="Twitter" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.linkedin_icon} alt="LinkedIn" />
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
            >
              <img src={assets.facebook_icon} alt="Facebook" />
            </a>

          </div>

        </div>


        <div className="footer-content-center">

          <h2>Company</h2>

          <ul>

            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/about">About Us</Link>
            </li>

            <li>
              <Link to="/delivery">Delivery</Link>
            </li>

            <li>
              <Link to="/privacy">Privacy policy</Link>
            </li>

          </ul>

        </div>


        <div className="footer-content-right">

          <h2>Contact Us</h2>

          <ul>
            <li>+91-8652046450</li>
            <li>contact@fooddeliveryapp.com</li>
          </ul>

        </div>

      </div>

      <hr />

      <p className='footer-copyright'>
        © {new Date().getFullYear()} Foodyra. All rights reserved.
      </p>

    </div>
  )
}

export default Footer