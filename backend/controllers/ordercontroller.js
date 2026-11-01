import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import mongoose from "mongoose";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";

let stripe;

const getStripe = () => {
  if (!stripe) {
    console.log(
      "Stripe Key Loaded:",
      !!process.env.STRIPE_SECRET_KEY
    );

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing");
    }

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
};


// ===============================
// PLACE ORDER
// ===============================
const placeOrder = async (req, res) => {
  let newOrder;
  let checkoutSession;
  try {
    const stripe = getStripe();
    const frontend_url =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      "http://localhost:5173";

    const requestItems = req.body.items;
    if (!Array.isArray(requestItems) || requestItems.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }
    if (!req.body.address || !req.body.address.street || !req.body.address.phone) {
      return res.status(400).json({ success: false, message: "A delivery address and phone number are required" });
    }
    const requestedQuantities = new Map();
    for (const item of requestItems) {
      const foodId = item?._id || item?.id;
      const quantity = Number(item?.quantity);
      if (!mongoose.Types.ObjectId.isValid(foodId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return res.status(400).json({ success: false, message: "Invalid food item or quantity" });
      }
      requestedQuantities.set(String(foodId), (requestedQuantities.get(String(foodId)) || 0) + quantity);
    }
    const foods = await foodModel.find({
      _id: { $in: [...requestedQuantities.keys()] },
      isAvailable: { $ne: false }
    }).lean();
    if (foods.length !== requestedQuantities.size || foods.some((food) => !food.restaurantId)) {
      return res.status(400).json({ success: false, message: "One or more selected items are unavailable" });
    }
    const restaurantIds = new Set(foods.map((food) => String(food.restaurantId)));
    if (restaurantIds.size !== 1) {
      return res.status(400).json({ success: false, message: "An order can only contain items from one restaurant" });
    }
    const restaurant = await restaurantModel.findOne({ _id: foods[0].restaurantId, isActive: true }).lean();
    if (!restaurant) return res.status(400).json({ success: false, message: "This restaurant is currently unavailable" });
    const orderItems = foods.map((food) => ({
      _id: food._id,
      name: food.name,
      description: food.description,
      category: food.category,
      image: food.image,
      price: food.price,
      restaurantId: food.restaurantId,
      quantity: requestedQuantities.get(String(food._id))
    }));
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({ success: false, message: `Minimum order for this restaurant is ₹${restaurant.minimumOrder}` });
    }
    const savedAddress = {
      firstName: String(req.body.address.firstName || "").trim(),
      lastName: String(req.body.address.lastName || "").trim(),
      email: String(req.body.address.email || "").trim(),
      street: String(req.body.address.street || "").trim(),
      city: String(req.body.address.city || "").trim(),
      state: String(req.body.address.state || "").trim(),
      zipcode: String(req.body.address.zipcode || "").trim(),
      country: String(req.body.address.country || "").trim(),
      phone: String(req.body.address.phone || "").trim()
    };
    const user = await userModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { phone: savedAddress.phone, deliveryAddress: savedAddress } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "Account not found. Please sign in again." });
    }

    const deliveryFee = Number(restaurant.deliveryFee || 0);
    newOrder = new orderModel({
      userId: req.body.userId,
      items: orderItems,
      amount: subtotal + deliveryFee,
      deliveryFee,
      restaurantId: restaurant._id,
      address: req.body.address,
      status: "Placed"
    });
    await newOrder.save();
    const line_items = orderItems.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100)
      },
      quantity: Number(item.quantity)
    }));
    if (deliveryFee > 0) {
      line_items.push({
        price_data: { currency: "inr", product_data: { name: "Delivery Charges" }, unit_amount: Math.round(deliveryFee * 100) },
        quantity: 1
      });
    }
    checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: { orderId: String(newOrder._id), userId: String(req.body.userId) },
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
    });
    newOrder.stripeSessionId = checkoutSession.id;
    await newOrder.save();
    try {
      await userModel.findByIdAndUpdate(req.body.userId, { $set: { cartData: {} } });
    } catch (cartError) {
      console.error("Unable to clear cart after order creation:", cartError.message);
    }
    return res.json({ success: true, session_url: checkoutSession.url, orderId: newOrder._id });
  } catch (error) {
    if (newOrder?._id && !checkoutSession) {
      await orderModel.findByIdAndDelete(newOrder._id).catch((cleanupError) => {
        console.error("Unable to clean up incomplete order:", cleanupError.message);
      });
    }
    console.error("PLACE ORDER ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: checkoutSession
        ? "Payment session was created, but the order could not be finalized. Please contact support before trying again."
        : error.message || "Unable to place order"
    });
  }
};


// ===============================
// VERIFY ORDER
// ===============================
const verifyOrder = async (req, res) => {

  try {

    const { orderId, success, sessionId, userId } = req.body;

    // Check order ID
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is missing"
      });
    }

    // Check MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log("Invalid Order ID:", orderId);

      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.userId !== String(userId)) {
      return res.status(403).json({ success: false, message: "You are not authorized to verify this order" });
    }
    if (success === true || success === "true") {
      if (!sessionId || !order.stripeSessionId || sessionId !== order.stripeSessionId) {
        return res.status(400).json({ success: false, message: "Payment session does not match this order" });
      }
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.orderId !== String(order._id) || session.payment_status !== "paid") {
        return res.status(402).json({ success: false, message: "Payment has not been confirmed" });
      }
      order.payment = true;
      order.status = "Confirmed";
      await order.save();
      return res.json({ success: true, message: "Payment verified" });
    }

    if (!order.payment) {
      order.status = "Cancelled";
      await order.save();
    }
    return res.json({ success: false, message: "Payment cancelled" });
  } catch (error) {
    console.error("VERIFY ORDER ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Unable to verify payment" });
  }
};


// ===============================
// USER ORDERS
// ===============================
const userOrders = async (req, res) => {

  try {

    const orders = await orderModel.find({
      userId: req.body.userId?.toString()
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {

    console.log(
      "USER ORDERS ERROR:",
      error
    );

    res.json({
      success: false,
      message: "Error fetching user orders"
    });
  }
};


// ===============================
// ADMIN ORDERS
// ===============================
const listOrders = async (req, res) => {

  try {

    const orders = await orderModel.find({}).populate("restaurantId", "name").sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: orders
    });

  } catch (error) {

    console.error("LIST ORDERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Error fetching orders"
    });
  }
};


// ===============================
// UPDATE ORDER STATUS
// ===============================
const updateStatus = async (req, res) => {

  try {

    if (!req.body.orderId || !req.body.status) {

      return res.json({
        success: false,
        message: "Missing data"
      });
    }

    const validStatuses = ["Confirmed", "Preparing", "Out For Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }
    const order = await orderModel.findById(req.body.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    const transitions = {
      "Food Processing": ["Confirmed", "Preparing", "Out For Delivery", "Cancelled"],
      Placed: ["Confirmed", "Cancelled"],
      Confirmed: ["Preparing", "Cancelled"],
      Preparing: ["Out For Delivery", "Cancelled"],
      "Out For Delivery": ["Delivered"]
    };
    if (order.status !== req.body.status && !transitions[order.status]?.includes(req.body.status)) {
      return res.status(409).json({ success: false, message: `Cannot move an order from ${order.status} to ${req.body.status}` });
    }
    if (!order.payment && req.body.status !== "Cancelled") {
      return res.status(409).json({ success: false, message: "Cannot process an order before payment is confirmed" });
    }
    order.status = req.body.status;
    await order.save();

    return res.json({
      success: true,
      message: "Status Updated"
    });

  } catch (error) {

    console.error("UPDATE STATUS ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus
};