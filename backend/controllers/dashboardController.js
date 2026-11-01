import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import restaurantModel from "../models/restaurantModel.js";
import userModel from "../models/userModel.js";

export const getDashboard = async (_req, res) => {
    try {
        const [orderCount, restaurants, foodItems, customers, pendingOrders, completedOrders, revenueRows, recentOrders, statusRows] = await Promise.all([
            orderModel.countDocuments(),
            restaurantModel.countDocuments(),
            foodModel.countDocuments(),
            userModel.countDocuments(),
            orderModel.countDocuments({ status: { $in: ["Placed", "Confirmed", "Preparing", "Food Processing"] }, payment: true }),
            orderModel.countDocuments({ status: "Delivered", payment: true }),
            orderModel.aggregate([{ $match: { payment: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
            orderModel.find().populate("restaurantId", "name").sort({ createdAt: -1 }).limit(6).lean(),
            orderModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        ]);
        return res.json({
            success: true,
            data: {
                orderCount,
                restaurants,
                foodItems,
                customers,
                pendingOrders,
                completedOrders,
                revenue: revenueRows[0]?.total || 0,
                recentOrders,
                orderStatuses: statusRows.map(({ _id, count }) => ({ status: _id, count }))
            }
        });
    } catch (error) {
        console.error("DASHBOARD ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load dashboard metrics" });
    }
};
