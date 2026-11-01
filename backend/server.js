import dotenv from "dotenv";
dotenv.config();

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
}

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();
const port = process.env.PORT || 4000;
const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "uploads");

// =========================
// CORS
// =========================
const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "https://food-delivery-app-lemon-phi.vercel.app",
    "https://food-delivery-app-gd5y.vercel.app",
    ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean)
]);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    }
}));

// =========================
// BODY PARSER
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// STATIC IMAGES
// =========================
app.use("/images", express.static(uploadDirectory));

// =========================
// DATABASE
// =========================

// =========================
// API ROUTES
// =========================
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/admin", adminRouter);

// =========================
// TEST ROUTE
// =========================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Food Delivery API Working"
    });
});

// =========================
// START SERVER
// =========================
await connectDB();

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});