import express from "express"
import { addFood, listFood, adminListFood, assignFoodRestaurant, updateFood, removeFood} from "../controllers/foodController.js"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import adminAuth from "../middleware/adminAuth.js"

const foodRouter = express.Router();
const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

// Image storage engine 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
          cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
    }
})

const Upload = multer({ storage: storage })

foodRouter.post("/add", adminAuth, Upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.get("/admin-list", adminAuth, adminListFood)
foodRouter.patch("/:id/restaurant", adminAuth, assignFoodRestaurant)
foodRouter.put("/:id", adminAuth, Upload.single("image"), updateFood)
foodRouter.post("/remove", adminAuth, removeFood);

export default foodRouter;