import React, { useCallback, useEffect, useState } from 'react'
import './List.css'
import axios from "axios"
import { toast } from "react-toastify"

const List = ({url, token}) => {
   
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await axios.get(`${url}/api/food/admin-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setList(response.data.data);
      } else {
        const message = response.data.message || "Unable to fetch products";
        setLoadError(message);
        toast.error(message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unable to fetch products";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [url, token])

  const assignRestaurant = async (foodId, restaurantId) => {
    if (!restaurantId) return;
    try {
      const response = await axios.patch(`${url}/api/food/${foodId}/restaurant`, { restaurantId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success(response.data.message);
      await fetchList();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to assign restaurant");
    }
  }

  const saveFood = async (event) => {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    body.delete("image");
    const replacementImage = event.currentTarget.elements.image.files[0];
    if (replacementImage) body.append("image", replacementImage);
    body.set("isAvailable", event.currentTarget.elements.isAvailable.checked ? "true" : "false");
    setIsSaving(true);
    try {
      const response = await axios.put(`${url}/api/food/${editingItem._id}`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data.success) throw new Error(response.data.message);
      toast.success(response.data.message);
      setEditingItem(null);
      await fetchList();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to update food item");
    } finally {
      setIsSaving(false);
    }
  };

  const removeFood = async(foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message || "Unable to remove product");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to remove product");
    }
  }

  useEffect(() => {
    fetchList();
  }, [fetchList])

  useEffect(() => {
    axios.get(`${url}/api/restaurants/admin-list`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data }) => {
      if (data.success) setRestaurants(data.data.filter((restaurant) => restaurant.isActive));
    }).catch((error) => toast.error(error.response?.data?.message || "Unable to load restaurants"));
  }, [url, token])

  return (
    <div className='list add flex-col'>
      <p>All Food List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Restaurant</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {isLoading && <p>Loading products...</p>}
        {!isLoading && loadError && <p>{loadError}</p>}
        {!isLoading && !loadError && list.length === 0 && <p>No products found.</p>}
        {list.map((item) => {
          return (
            <div key={item._id} className='list-table-format'>
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.name}</p>
              <select aria-label={`Assign restaurant to ${item.name}`} value={item.restaurantId?._id || ""} onChange={(event) => assignRestaurant(item._id, event.target.value)}>
                <option value="">Unassigned</option>
                {restaurants.map((restaurant) => <option value={restaurant._id} key={restaurant._id}>{restaurant.name}</option>)}
              </select>
              <p>{item.category}</p>
              <p>{item.price}</p>
              <div className="food-list-actions">
                <button type="button" onClick={() => setEditingItem(item)}>Edit</button>
                <button type="button" onClick={() => removeFood(item._id)} aria-label={`Remove ${item.name}`}>×</button>
              </div>
            </div>
          )
        })}

      </div>
      {editingItem && <div className="food-edit-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingItem(null); }}>
        <form className="food-edit-modal" onSubmit={saveFood}>
          <h2>Edit menu item</h2>
          <label>Name<input name="name" required defaultValue={editingItem.name} /></label>
          <label>Description<textarea name="description" rows="3" required defaultValue={editingItem.description} /></label>
          <label>Restaurant<select name="restaurantId" defaultValue={editingItem.restaurantId?._id || ""} required>
            <option value="">Select a restaurant</option>{restaurants.map((restaurant) => <option value={restaurant._id} key={restaurant._id}>{restaurant.name}</option>)}
          </select></label>
          <div className="food-edit-pair">
            <label>Category<input name="category" required defaultValue={editingItem.category} /></label>
            <label>Price<input name="price" type="number" min="0.01" step="0.01" required defaultValue={editingItem.price} /></label>
          </div>
          <label>Replace image (optional)<input name="image" type="file" accept="image/*" /></label>
          <label>Dietary type<select name="vegetarian" defaultValue={editingItem.vegetarian === true ? "true" : editingItem.vegetarian === false ? "false" : ""}><option value="">Not specified</option><option value="true">Vegetarian</option><option value="false">Non-vegetarian</option></select></label>
          <label className="food-edit-available"><input type="checkbox" name="isAvailable" value="true" defaultChecked={editingItem.isAvailable !== false} /> Available to order</label>
          <div className="food-edit-actions"><button type="button" onClick={() => setEditingItem(null)}>Cancel</button><button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</button></div>
        </form>
      </div>}
    </div>
  )
}

export default List