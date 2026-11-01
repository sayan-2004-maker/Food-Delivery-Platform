import React from 'react'
import './Appdownload.css'
import { assets } from '../../assets/assets'

const Appdownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <p>
        Download our app for the best experience <br /> Food Delivery Platform
      </p>

      <div className="app-download-platforms">
        <a
          href="https://play.google.com/store"
          target="_blank"
          rel="noreferrer"
          aria-label="Open Google Play"
        >
          <img src={assets.play_store} alt="Get it on Google Play" />
        </a>
        <a
          href="https://apps.apple.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Open the Apple App Store"
        >
          <img src={assets.app_store} alt="Download on the App Store" />
        </a>
      </div>

    </div>
  )
}

export default Appdownload