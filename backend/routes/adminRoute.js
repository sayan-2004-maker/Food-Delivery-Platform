import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { getDashboard } from "../controllers/dashboardController.js";

const adminRouter = express.Router();
adminRouter.get("/dashboard", adminAuth, getDashboard);

export default adminRouter;
