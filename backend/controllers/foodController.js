import foodModel from "../models/foodModel.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import restaurantModel from "../models/restaurantModel.js";

const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

// add food item
const addFood = async (req, res)=>{
  const imageFilename = req.file?.filename;
  try {
    if (!req.body.name?.trim() || !req.body.description?.trim() || !req.body.category?.trim()) {
      return res.status(400).json({ success: false, message: "Name, description and category are required" });
    }
    if (!imageFilename) return res.status(400).json({ success: false, message: "Food image is required" });
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ success: false, message: "Price must be greater than zero" });

    let restaurantId = null;
    if (req.body.restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId)) {
        return res.status(400).json({ success: false, message: "Invalid restaurant" });
      }
      const restaurant = await restaurantModel.findOne({ _id: req.body.restaurantId, isActive: true });
      if (!restaurant) return res.status(400).json({ success: false, message: "Choose an active restaurant" });
      restaurantId = restaurant._id;
    }

    const food = new foodModel({
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      price,
      category: req.body.category.trim(),
      image: imageFilename,
      restaurantId,
      isAvailable: req.body.isAvailable !== "false",
      vegetarian: req.body.vegetarian === "true" ? true : req.body.vegetarian === "false" ? false : null
    });
    await food.save();
    return res.status(201).json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    if (imageFilename) await fs.unlink(path.join(uploadDirectory, imageFilename)).catch(() => {});
    console.error("ADD FOOD ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Unable to add food" });
  }
}

// all food list 
const listFood = async (req,res) =>{
    try {
      const filter = { isAvailable: { $ne: false }, restaurantId: { $ne: null } };
      if (req.query.restaurantId && mongoose.Types.ObjectId.isValid(req.query.restaurantId)) {
        filter.restaurantId = req.query.restaurantId;
      }
      const foods = await foodModel.find(filter).populate("restaurantId", "name deliveryFee minimumOrder").lean();
      res.json({ success: true, data: foods });
    } catch (error) {
      console.error("LIST FOOD ERROR:", error.message);
      res.status(500).json({ success: false, message: "Unable to load food items" });
    }
}

const adminListFood = async (_req, res) => {
    try {
      const foods = await foodModel.find({}).populate("restaurantId", "name").sort({ createdAt: -1 }).lean();
      return res.json({ success: true, data: foods });
    } catch (error) {
      console.error("ADMIN LIST FOOD ERROR:", error.message);
      return res.status(500).json({ success: false, message: "Unable to load food items" });
    }
};

const assignFoodRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.body;
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return res.status(400).json({ success: false, message: "Choose a valid restaurant" });
      }
      const restaurant = await restaurantModel.findOne({ _id: restaurantId, isActive: true });
      if (!restaurant) return res.status(400).json({ success: false, message: "Choose an active restaurant" });
      const food = await foodModel.findByIdAndUpdate(req.params.id, { restaurantId }, { new: true }).populate("restaurantId", "name");
      if (!food) return res.status(404).json({ success: false, message: "Food item not found" });
      return res.json({ success: true, data: food, message: "Restaurant assigned to food" });
    } catch (error) {
      console.error("ASSIGN FOOD RESTAURANT ERROR:", error.message);
      return res.status(400).json({ success: false, message: "Unable to assign restaurant" });
    }
};

const updateFood = async (req, res) => {
    try {
      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name.trim();
      if (req.body.description !== undefined) updates.description = req.body.description.trim();
      if (req.body.category !== undefined) updates.category = req.body.category.trim();
      if (req.body.price !== undefined) {
        const price = Number(req.body.price);
        if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ success: false, message: "Price must be greater than zero" });
        updates.price = price;
      }
      if (req.body.isAvailable !== undefined) updates.isAvailable = req.body.isAvailable === "true" || req.body.isAvailable === true;
      if (req.body.vegetarian !== undefined) updates.vegetarian = req.body.vegetarian === "true" ? true : req.body.vegetarian === "false" ? false : null;
      if (req.body.restaurantId) {
        if (!mongoose.Types.ObjectId.isValid(req.body.restaurantId) || !await restaurantModel.exists({ _id: req.body.restaurantId, isActive: true })) {
          return res.status(400).json({ success: false, message: "Choose an active restaurant" });
        }
        updates.restaurantId = req.body.restaurantId;
      }
      if (req.file) updates.image = req.file.filename;
      const food = await foodModel.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate("restaurantId", "name");
      if (!food) return res.status(404).json({ success: false, message: "Food item not found" });
      return res.json({ success: true, data: food, message: "Food item updated" });
    } catch (error) {
      console.error("UPDATE FOOD ERROR:", error.message);
      return res.status(400).json({ success: false, message: "Unable to update food item" });
    }
};

// remove food item 
const removeFood = async (req,res)=>{
    try {
      const food = await foodModel.findById(req.body.id);
      if (!food) return res.status(404).json({ success: false, message: "Food item not found" });
      await foodModel.findByIdAndDelete(req.body.id);
      await fs.unlink(path.join(uploadDirectory, food.image)).catch((error) => {
        if (error.code !== "ENOENT") console.error("REMOVE FOOD IMAGE ERROR:", error.message);
      });
      return res.json({ success: true, message: "Food Removed" });
    } catch (error) {
      console.error("REMOVE FOOD ERROR:", error.message);
      return res.status(400).json({ success: false, message: "Unable to remove food item" });
    }
}

export { addFood, listFood, adminListFood, assignFoodRestaurant, updateFood, removeFood }