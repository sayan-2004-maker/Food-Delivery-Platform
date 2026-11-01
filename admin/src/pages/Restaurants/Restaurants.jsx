import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { normalizeCuisines } from "../../utils/normalizeCuisines";
import "./Restaurants.css";

const initialForm = {
  name: "",
  description: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  cuisines: "",
  offerLabel: "",
  phone: "",
  openingHours: "",
  deliveryFee: "0",
  minimumOrder: "0",
  averageCostForTwo: "0",
  deliveryTime: "35",
  isActive: true
};

const Restaurants = ({ url, token }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${url}/api/restaurants/admin-list`, { headers });
      if (!data.success) throw new Error(data.message || "Unable to fetch restaurants");
      setRestaurants(data.data.map((restaurant) => ({
        ...restaurant,
        cuisines: normalizeCuisines(restaurant.cuisines)
      })));
    } catch (requestError) {
      const message = requestError.response?.data?.message || requestError.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [headers, url]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const changeForm = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setImage(null);
    setEditingId("");
  };

  const editRestaurant = (restaurant) => {
    setEditingId(restaurant._id);
    setForm({
      name: restaurant.name,
      description: restaurant.description,
      street: restaurant.address.street,
      city: restaurant.address.city,
      state: restaurant.address.state,
      zipcode: restaurant.address.zipcode || "",
      cuisines: normalizeCuisines(restaurant.cuisines).join(", "),
      offerLabel: restaurant.offerLabel || "",
      phone: restaurant.phone || "",
      openingHours: restaurant.openingHours || "",
      deliveryFee: String(restaurant.deliveryFee),
      minimumOrder: String(restaurant.minimumOrder),
      averageCostForTwo: String(restaurant.averageCostForTwo),
      deliveryTime: String(restaurant.deliveryTime),
      isActive: restaurant.isActive
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!editingId && !image) {
      toast.error("Choose a restaurant cover image");
      return;
    }
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== "cuisines") body.append(key, String(value));
    });
    body.set("cuisines", JSON.stringify(normalizeCuisines(form.cuisines.split(","))));
    body.append("address", JSON.stringify({
      street: form.street,
      city: form.city,
      state: form.state,
      zipcode: form.zipcode
    }));
    if (image) body.append("image", image);
    setBusy(true);
    try {
      const { data } = await axios({
        method: editingId ? "put" : "post",
        url: editingId ? `${url}/api/restaurants/${editingId}` : `${url}/api/restaurants`,
        data: body,
        headers
      });
      if (!data.success) throw new Error(data.message || "Unable to save restaurant");
      toast.success(data.message);
      resetForm();
      await fetchRestaurants();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || "Unable to save restaurant");
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (restaurant) => {
    if (!window.confirm(`Deactivate ${restaurant.name}? Its existing orders and menu records will be preserved.`)) return;
    try {
      const { data } = await axios.patch(`${url}/api/restaurants/${restaurant._id}/deactivate`, {}, { headers });
      if (!data.success) throw new Error(data.message || "Unable to deactivate restaurant");
      toast.success(data.message);
      await fetchRestaurants();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || "Unable to deactivate restaurant");
    }
  };

  return (
    <main className="restaurant-admin-page">
      <header className="restaurant-admin-heading">
        <div><p className="restaurant-eyebrow">BUSINESS MANAGEMENT</p><h1>Restaurants</h1><p>Manage the restaurants and menus customers can discover.</p></div>
        <span className="restaurant-count">{restaurants.length} total</span>
      </header>

      <form className="restaurant-form" onSubmit={submit}>
        <div className="restaurant-form-heading">
          <div><h2>{editingId ? "Edit restaurant" : "Add a restaurant"}</h2><p>Use genuine restaurant details and clear menu associations.</p></div>
          {editingId && <button className="restaurant-secondary" type="button" onClick={resetForm}>Cancel edit</button>}
        </div>
        <div className="restaurant-form-grid">
          <label>Restaurant name<input name="name" value={form.name} onChange={changeForm} required maxLength="120" /></label>
          <label>Cuisines <span>(comma separated)</span><input name="cuisines" value={form.cuisines} onChange={changeForm} placeholder="Bengali, Biryani" required /></label>
          <label>Offer label <span>(optional)</span><input name="offerLabel" value={form.offerLabel} onChange={changeForm} placeholder="e.g. 10% off" /></label>
          <label className="restaurant-wide">Description<textarea name="description" value={form.description} onChange={changeForm} rows="3" required maxLength="1200" /></label>
          <label className="restaurant-wide">Cover image<input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required={!editingId} /></label>
          <label>Street address<input name="street" value={form.street} onChange={changeForm} required /></label>
          <label>City<input name="city" value={form.city} onChange={changeForm} required /></label>
          <label>State<input name="state" value={form.state} onChange={changeForm} required /></label>
          <label>Postal code<input name="zipcode" value={form.zipcode} onChange={changeForm} /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={changeForm} /></label>
          <label>Opening hours<input name="openingHours" value={form.openingHours} onChange={changeForm} placeholder="e.g. 10:00–22:00" /></label>
          <label>Delivery fee<input name="deliveryFee" value={form.deliveryFee} onChange={changeForm} type="number" min="0" step="0.01" required /></label>
          <label>Minimum order<input name="minimumOrder" value={form.minimumOrder} onChange={changeForm} type="number" min="0" step="0.01" required /></label>
          <label>Average cost for two<input name="averageCostForTwo" value={form.averageCostForTwo} onChange={changeForm} type="number" min="0" step="0.01" required /></label>
          <label>Delivery time (minutes)<input name="deliveryTime" value={form.deliveryTime} onChange={changeForm} type="number" min="1" required /></label>
          {editingId && <label className="restaurant-checkbox"><input type="checkbox" name="isActive" checked={form.isActive} onChange={changeForm} /> Available to customers</label>}
        </div>
        <button className="restaurant-primary" disabled={busy}>{busy ? "Saving..." : editingId ? "Save changes" : "Create restaurant"}</button>
      </form>

      <section className="restaurant-table">
        <h2>All restaurants</h2>
        {loading && <p>Loading restaurant records…</p>}
        {!loading && error && <div className="restaurant-empty">{error} <button type="button" onClick={fetchRestaurants}>Retry</button></div>}
        {!loading && !error && restaurants.length === 0 && <p className="restaurant-empty">No restaurants yet. Create one above to assign foods and publish its menu.</p>}
        {!loading && restaurants.map((restaurant) => (
          <article className="restaurant-row" key={restaurant._id}>
            <img src={`${url}/images/${restaurant.image}`} alt="" />
            <div className="restaurant-row-info"><strong>{restaurant.name}</strong><span>{restaurant.cuisines.join(" · ")}</span><small>{restaurant.address.city}, {restaurant.address.state}</small></div>
            <span className={restaurant.isActive ? "restaurant-status active" : "restaurant-status"}>{restaurant.isActive ? "Active" : "Inactive"}</span>
            <button type="button" className="restaurant-secondary" onClick={() => editRestaurant(restaurant)}>Edit</button>
            {restaurant.isActive && <button type="button" className="restaurant-danger" onClick={() => deactivate(restaurant)}>Deactivate</button>}
          </article>
        ))}
      </section>
    </main>
  );
};

export default Restaurants;
