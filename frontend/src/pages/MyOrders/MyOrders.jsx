import React, { useCallback, useEffect, useState, useContext } from 'react';
import './MyOrders.css'
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {

  const { url, token } = useContext(StoreContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Unable to load your orders");
      }
      setData(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Unable to load your orders");
    } finally {
      setLoading(false);
    }
  }, [token, url]);

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchOrders();
  }, [fetchOrders, token]);

  if (!token) {
    return (
      <div className="my-orders">
        <h2>My Orders</h2>
        <p>Please login again to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <h2>My Orders</h2>

      <div className="container">
        {loading && <p className="my-orders-message">Loading your orders…</p>}
        {!loading && error && <div className="my-orders-message my-orders-error" role="alert">{error}<button onClick={fetchOrders}>Try again</button></div>}
        {!loading && !error && data.length === 0 && <p className="my-orders-message">Your orders will appear here after you place one.</p>}
        {!loading && !error && data.map((order) => {
          const trackingSteps = [
            { status: "Placed", label: "Order placed" },
            { status: "Confirmed", label: "Order confirmed" },
            { status: "Preparing", label: "Being prepared" },
            { status: "Out For Delivery", label: "Out for delivery" },
            { status: "Delivered", label: "Delivered" }
          ];
          const currentStep = order.status === "Food Processing"
            ? 2
            : trackingSteps.findIndex((step) => step.status === order.status);
          const isTracking = trackingOrderId === order._id;

          return (
            <section key={order._id} className="my-order-card">
              <div className={`my-order-order${isTracking ? " is-tracking" : ""}`}>

                <img src={assets.parcel_icon} alt="" />

                <p>
                  {order.items && order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + " x " + item.quantity;
                    }
                    return item.name + " x " + item.quantity + ", ";
                  })}
                </p>

                <p>₹{Number(order.amount).toFixed(2)}</p>
                <p>Items: {order.items ? order.items.length : 0}</p>
                <p><span>&#x25cf;</span><b>{order.status}</b></p>
                <button
                  type="button"
                  aria-expanded={isTracking}
                  onClick={() => setTrackingOrderId(isTracking ? null : order._id)}
                >
                  {isTracking ? "Hide tracking" : "Track Order"}
                </button>
              </div>

              {isTracking && (
                <div className="my-order-tracking" aria-label={`Tracking status: ${order.status}`}>
                  <div className="my-order-tracking-heading">
                    <div>
                      <h3>Order tracking</h3>
                      <p>
                        {order.payment
                          ? "Payment confirmed"
                          : "Waiting for payment confirmation"}
                        {order.createdAt && ` · Placed ${new Date(order.createdAt).toLocaleString()}`}
                      </p>
                    </div>
                    <strong className={order.status === "Cancelled" ? "tracking-cancelled" : ""}>
                      {order.status}
                    </strong>
                  </div>
                  {order.status === "Cancelled" ? (
                    <p className="my-order-cancelled-message">This order was cancelled and will not proceed to delivery.</p>
                  ) : (
                    <ol className="my-order-tracking-steps">
                      {trackingSteps.map((step, index) => {
                        const isComplete = currentStep >= index;
                        const isCurrent = currentStep === index;
                        return (
                          <li
                            key={step.status}
                            className={`${isComplete ? "complete" : ""} ${isCurrent ? "current" : ""}`}
                          >
                            <span className="tracking-step-marker">{isComplete ? "✓" : index + 1}</span>
                            <span>{step.label}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  {order.address && (
                    <p className="my-order-tracking-address">
                      Delivering to: {[order.address.street, order.address.city, order.address.zipcode].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}
            </section>
          )
        })}
      </div>

    </div>
  )
}

export default MyOrders;