import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import adminAuth from "../middleware/adminAuth.js";
import {
    adminListRestaurants,
    createRestaurant,
    deactivateRestaurant,
    getRestaurant,
    listRestaurants,
    updateRestaurant
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();
const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");
const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, uploadDirectory),
        filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) return callback(new Error("Upload an image file"));
        return callback(null, true);
    }
});

restaurantRouter.get("/list", listRestaurants);
restaurantRouter.get("/admin-list", adminAuth, adminListRestaurants);
restaurantRouter.get("/:id", getRestaurant);
restaurantRouter.post("/", adminAuth, upload.single("image"), createRestaurant);
restaurantRouter.put("/:id", adminAuth, upload.single("image"), updateRestaurant);
restaurantRouter.patch("/:id/deactivate", adminAuth, deactivateRestaurant);

export default restaurantRouter;
