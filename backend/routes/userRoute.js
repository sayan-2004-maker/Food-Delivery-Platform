import express from "express"
import { getProfile, loginUser,registerUser } from "../controllers/userController.js"
import { adminLogin } from "../controllers/adminController.js"
import authMiddleware from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
userRouter.get("/profile", authMiddleware, getProfile)
userRouter.post("/admin/login", adminLogin)

export default userRouter;