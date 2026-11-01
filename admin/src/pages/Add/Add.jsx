import React, { useState } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import  axios from "axios"
import { toast } from 'react-toastify'

const Add = ({url, token}) => {

  const [image, setImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantError, setRestaurantError] = useState("");
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
    restaurantId: "",
    vegetarian: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => { 
    event.preventDefault();
    const form = event.currentTarget;
    if (!image) {
      toast.error("Please upload a product image");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name.trim());
    formData.append("description", data.description.trim());
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("restaurantId", data.restaurantId);
    formData.append("vegetarian", data.vegetarian);
    formData.append("image", image);

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        form.reset();
        setData({
          name: "",
          description: "",
          price: "",
          category: "Salad",
          restaurantId: "",
          vegetarian: ""
        });
        setImage(false);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Unable to add product");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to add product");
    } finally {
      setIsSubmitting(false);
    }
  }

  React.useEffect(() => {
    axios.get(`${url}/api/restaurants/admin-list`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data: response }) => {
      if (response.success) {
        setRestaurants(response.data.filter((restaurant) => restaurant.isActive));
      } else {
        setRestaurantError(response.message || "Unable to load restaurants");
      }
    }).catch((error) => {
      setRestaurantError(error.response?.data?.message || "Create a restaurant before adding food");
    });
  }, [url, token]);

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>

        <div className="add-product-name flex-col">
          <p>Restaurant</p>
          <select onChange={onChangeHandler} value={data.restaurantId} name="restaurantId" required>
            <option value="">Select a restaurant</option>
            {restaurants.map((restaurant) => <option value={restaurant._id} key={restaurant._id}>{restaurant.name}</option>)}
          </select>
          {restaurantError && <small>{restaurantError}</small>}
        </div>

        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" accept="image/*" hidden required />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.description} name="description" rows="6" placeholder="Write content here" required></textarea>
        </div>

        <div className="add-category-price">

          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Salad">Salad</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Dessert">Dessert</option>
              <option value="Main Course">Main Course</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name='price' min="0.01" step="0.01" placeholder='₹20' required />
          </div>

        </div>

        <div className="add-product-name flex-col">
          <p>Dietary type</p>
          <select onChange={onChangeHandler} value={data.vegetarian} name="vegetarian">
            <option value="">Not specified</option>
            <option value="true">Vegetarian</option>
            <option value="false">Non-vegetarian</option>
          </select>
        </div>

        <button type='submit' className='add-btn' disabled={isSubmitting}>
          {isSubmitting ? "ADDING..." : "ADD"}
        </button>

      </form>
    </div>
  )
}

export default Add