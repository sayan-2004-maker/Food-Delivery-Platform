import express from "express"
import authMiddleware from "../middleware/auth.js"
import { placeOrder, verifyOrder, userOrders, listOrders, updateStatus} from "../controllers/ordercontroller.js"
import adminAuth from "../middleware/adminAuth.js"

const orderRouter=express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",authMiddleware,verifyOrder)
orderRouter.post("/userorders",authMiddleware, userOrders);
orderRouter.get('/list', adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);


export default orderRouter;