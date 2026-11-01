import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import RestaurantCard from "../../components/RestaurantCard/RestaurantCard";
import { normalizeCuisines } from "../../utils/normalizeCuisines";
import "./Restaurants.css";

const Restaurants = () => {
  const { url, token } = useContext(StoreContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [cuisine, setCuisine] = useState(searchParams.get("cuisine") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [maxCost, setMaxCost] = useState(searchParams.get("maxCost") || "");
  const [maxDelivery, setMaxDelivery] = useState(searchParams.get("maxDelivery") || "");
  const [vegetarian, setVegetarian] = useState(searchParams.get("vegetarian") === "true");
  const [offers, setOffers] = useState(searchParams.get("offers") === "true");
  const [cuisines, setCuisines] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(searchParams.get("location")));
  const [error, setError] = useState("");
  const [locationRestoreError, setLocationRestoreError] = useState("");
  const [locationRestoreLoading, setLocationRestoreLoading] = useState(false);
  const locationRestoreAttempted = useRef(false);
  const unavailableLocation = searchParams.get("location")?.trim() || "";
  const hasLocation = Boolean(unavailableLocation);
  const locationUnavailable = hasLocation && !loading && !error && restaurants.length === 0;

  const loadRestaurants = useCallback(async (targetPage = 1) => {
    if (!searchParams.get("location")?.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${url}/api/restaurants/list`, {
        params: {
          location: searchParams.get("location") || undefined,
          cuisine: searchParams.get("cuisine") || undefined,
          maxCost: searchParams.get("maxCost") || undefined,
          maxDelivery: searchParams.get("maxDelivery") || undefined,
          vegetarian: searchParams.get("vegetarian") || undefined,
          offers: searchParams.get("offers") || undefined,
          sort: searchParams.get("sort") || "relevance",
          page: targetPage,
          limit: 12
        }
      });
      if (!data.success) throw new Error(data.message || "Unable to load restaurants");
      setRestaurants(data.data);
      setTotal(data.pagination.total);
      setPages(data.pagination.pages);
      setPage(targetPage);
      setCuisines([...new Set((data.filters?.cuisines || []).flatMap(normalizeCuisines))]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load restaurants");
    } finally {
      setLoading(false);
    }
  }, [url, searchParams]);

  useEffect(() => {
    if (!searchParams.get("location")?.trim()) return;
    loadRestaurants(1);
  }, [loadRestaurants, searchParams]);

  useEffect(() => {
    if (locationRestoreAttempted.current || searchParams.get("location")?.trim() || !token) return;
    locationRestoreAttempted.current = true;
    setLocationRestoreLoading(true);

    axios.get(`${url}/api/user/profile`, { headers: { token } })
      .then(({ data }) => {
        if (!data.success) {
          throw new Error(data.message || "Unable to load your saved delivery location");
        }
        const address = data.data.address || {};
        const savedLocation = address.zipcode || address.city || "";
        if (savedLocation) {
          setLocation(savedLocation);
          setSearchParams({ location: savedLocation });
        }
      })
      .catch((requestError) => {
        setLocationRestoreError(
          requestError.response?.data?.message ||
          requestError.message ||
          "Unable to load your saved delivery location"
        );
      })
      .finally(() => {
        setLocationRestoreLoading(false);
      });
  }, [searchParams, setSearchParams, token, url]);

  const search = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    setLoading(Boolean(location.trim()));
    setSearchParams(params);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    const values = { location: location.trim(), cuisine, maxCost, maxDelivery, vegetarian: vegetarian ? "true" : "", offers: offers ? "true" : "", sort: sort === "relevance" ? "" : sort };
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
    setLoading(Boolean(location.trim()));
    setSearchParams(params);
  };

  return (
    <main className="restaurant-list-page">
      <header className="restaurant-list-heading">
        <span className="discovery-kicker">FOODYRA RESTAURANTS</span>
        <h1>Find your next favourite</h1>
        <p>Enter your city or PIN code to see restaurants serving your area.</p>
      </header>
      <form className="restaurant-filter-search" onSubmit={search}>
        <input aria-label="Filter by city or PIN code" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter your city or PIN code" required />
        <button type="submit">Search</button>
      </form>
      {hasLocation && !locationUnavailable && <section className="restaurant-filter-bar" aria-label="Restaurant filters">
        <select value={cuisine} onChange={(event) => setCuisine(event.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map((item) => <option value={item} key={item}>{item}</option>)}
        </select>
        <select value={maxCost} onChange={(event) => setMaxCost(event.target.value)}>
          <option value="">Any price</option><option value="300">Up to ₹300 for two</option><option value="700">Up to ₹700 for two</option><option value="1200">Up to ₹1,200 for two</option>
        </select>
        <select value={maxDelivery} onChange={(event) => setMaxDelivery(event.target.value)}>
          <option value="">Any delivery time</option><option value="30">Under 30 minutes</option><option value="45">Under 45 minutes</option>
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="relevance">Recommended</option><option value="delivery">Fastest delivery</option><option value="price">Cost: low to high</option><option value="price-desc">Cost: high to low</option>
        </select>
        <label className="restaurant-veg-filter"><input type="checkbox" checked={vegetarian} onChange={(event) => setVegetarian(event.target.checked)} /> Vegetarian menu</label>
        <label className="restaurant-veg-filter"><input type="checkbox" checked={offers} onChange={(event) => setOffers(event.target.checked)} /> Offers</label>
        <button type="button" onClick={() => { setLocation(""); setCuisine(""); setMaxCost(""); setMaxDelivery(""); setVegetarian(false); setOffers(false); setSort("relevance"); setLoading(false); setSearchParams({}); }}>Clear</button>
        <button type="button" onClick={applyFilters}>Apply filters</button>
      </section>}
      {hasLocation && !locationUnavailable && <div className="restaurant-result-count">{loading ? "Finding restaurants…" : `${total} restaurant${total === 1 ? "" : "s"} found`}</div>}
      {loading && hasLocation && <div className="restaurant-list-grid">{[1, 2, 3, 4, 5, 6].map((item) => <div className="restaurant-skeleton" key={item}><div /><span /><span /></div>)}</div>}
      {!loading && error && <div className="restaurant-list-state"><p>{error}</p><button onClick={() => loadRestaurants(1)}>Retry</button></div>}
      {!loading && !error && locationUnavailable && (
        <div className="restaurant-list-state restaurant-location-unavailable" role="status">
          <span className="restaurant-unavailable-icon" aria-hidden="true">!</span>
          <span className="discovery-kicker">DELIVERY UPDATE</span>
          <h2>We’re currently not serving in {unavailableLocation}.</h2>
          <p>We’ll be back soon. Search another city or PIN code above to check availability.</p>
        </div>
      )}
      {!loading && !error && !hasLocation && (
        <div className="restaurant-list-state restaurant-location-prompt" role="status">
          {locationRestoreError
            ? `${locationRestoreError}. Enter your city or PIN code above to search manually.`
            : locationRestoreLoading
              ? "Loading your saved location…"
              : token
                ? "No saved delivery location found. Enter your city or PIN code above to search."
              : "Enter your city or PIN code above to find restaurants near you."}
        </div>
      )}
      {!loading && !error && hasLocation && restaurants.length > 0 && <>
        <div className="restaurant-list-grid">{restaurants.map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} imageBaseUrl={url} />)}</div>
        {pages > 1 && <div className="restaurant-pagination"><button disabled={page <= 1} onClick={() => loadRestaurants(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => loadRestaurants(page + 1)}>Next</button></div>}
      </>}
    </main>
  );
};

export default Restaurants;
