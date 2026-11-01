import React, { useCallback, useState, useEffect } from 'react'
import './Orders.css'
import { toast } from "react-toastify"
import axios from "axios"
import { assets } from "../../assets/assets";

const Orders = ({ url, token }) => {

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await axios.get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        const message = response.data.message || "Unable to fetch orders";
        setLoadError(message);
        toast.error(message);
      }

    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unable to fetch orders";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [url, token])

  const statusHandler = async (e, orderId) => {
    try {
      const response = await axios.post(
        `${url}/api/order/status`,
        {
          orderId: orderId,
          status: e.target.value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Status Updated");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Unable to update order status");
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to update order status");
    }
  }

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders])

  return (
    <div className='order add'>
      <h3>Orders Page</h3>

      <div className='order-list'> 

        {isLoading && <p>Loading orders...</p>}
        {!isLoading && loadError && <p>{loadError}</p>}
        {!isLoading && !loadError && orders.length === 0 && <p>No orders found.</p>}
        {orders.map((order) => (
          <div key={order._id} className="order-item">

            <img src={assets.parcel_icon} alt=""/>

            <div>

              <p className='order-item-food'>
                {order.items.map((item, i) => {
                  if (i === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  } else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>

              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>

              <div className="order-item-address">
                <p>{order.address.street},</p>
                <p>
                  {order.address.city}, {order.address.state}, {order.address.country}, {order.address.zipcode}
                </p>
              </div>

              <p className='order-item-phone'>{order.address.phone}</p>
              {order.restaurantId?.name && <p className="order-item-restaurant">Restaurant: {order.restaurantId.name}</p>}

            </div>

            <div>
              <p>Items: {order.items.length}</p>
              <p>₹{order.amount}</p>
              <p>Payment: {order.payment ? "Paid" : "Unpaid"}</p>

              <select 
                value={order.status}
                onChange={(e) => statusHandler(e, order._id)}
                disabled={!order.payment && order.status !== "Cancelled"}
              >
                {order.status === "Food Processing" && <option value="Food Processing">Food Processing (legacy)</option>}
                {!order.payment && order.status !== "Cancelled" && <option value={order.status}>Awaiting payment</option>}
                <option value="Placed">Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

            </div>

          </div>
        ))}

      </div>
    </div>
  )
}

export default Orders;