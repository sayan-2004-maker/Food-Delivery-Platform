import logo from './admin_logo.png?url'
import add_icon from './add_icon.png?url'
import order_icon from './order_icon.png?url'
import profile_image from './profile_image.png?url'
import upload_area from './upload_area.png?url'
import parcel_icon from './parcel_icon.png?url'

export const assets = {
  logo,
  add_icon,
  order_icon,
  profile_image,
  upload_area,
  parcel_icon,
}

export const url = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV
    ? "http://localhost:4000"
    : "https://food-delivery-backend-rbic.onrender.com"
);