import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = ({ url, token }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: response } = await axios.get(`${url}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.success) throw new Error(response.message || "Unable to load dashboard");
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [url, token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <main className="admin-dashboard"><p>Loading dashboard…</p></main>;
  if (error) return <main className="admin-dashboard"><div className="dashboard-error">{error}<button onClick={load}>Retry</button></div></main>;

  const metrics = [
    ["Total orders", data.orderCount, "📦"],
    ["Paid revenue", `₹${Number(data.revenue).toLocaleString("en-IN")}`, "₹"],
    ["Pending paid orders", data.pendingOrders, "◷"],
    ["Delivered orders", data.completedOrders, "✓"],
    ["Restaurants", data.restaurants, "⌂"],
    ["Menu items", data.foodItems, "☷"],
    ["Customers", data.customers, "♙"]
  ];
  const maximum = Math.max(1, ...data.orderStatuses.map((status) => status.count));

  return (
    <main className="admin-dashboard">
      <header className="dashboard-welcome"><div><p>FOODYRA OVERVIEW</p><h1>Dashboard</h1><span>Live totals from your database.</span></div><button onClick={load}>Refresh data</button></header>
      <section className="dashboard-metrics">{metrics.map(([label, value, icon]) => <article className="dashboard-metric" key={label}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>)}</section>
      <section className="dashboard-lower">
        <article className="dashboard-panel"><h2>Order status</h2>{data.orderStatuses.length === 0 && <p>No order records yet.</p>}{data.orderStatuses.map(({ status, count }) => <div className="dashboard-status" key={status}><div><span>{status || "Unspecified"}</span><strong>{count}</strong></div><div className="dashboard-bar"><span style={{ width: `${Math.max(4, count / maximum * 100)}%` }} /></div></div>)}</article>
        <article className="dashboard-panel"><h2>Recent orders</h2>{data.recentOrders.length === 0 && <p>No order records yet.</p>}{data.recentOrders.map((order) => <div className="dashboard-recent-order" key={order._id}><span><strong>{order.restaurantId?.name || "Legacy order"}</strong><small>{order.address?.firstName || "Customer"} {order.address?.lastName || ""} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date unavailable"}</small></span><span className="dashboard-order-total">₹{order.amount}</span><span className={`dashboard-order-status ${order.status === "Delivered" ? "done" : ""}`}>{order.status}</span></div>)}</article>
      </section>
    </main>
  );
};

export default Dashboard;
