import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";

const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

const normalizeCuisines = (value) => {
    const cuisines = [];

    const addCuisine = (value) => {
        const cuisine = value.trim().replaceAll("[", "").replaceAll("]", "").replace(/^["']+|["']+$/g, "").trim();
        if (cuisine && !cuisines.some((existing) => existing.toLowerCase() === cuisine.toLowerCase())) {
            cuisines.push(cuisine);
        }
    };

    const collect = (item, depth = 0) => {
        if (depth > 12) return;
        if (Array.isArray(item)) {
            item.forEach((value) => collect(value, depth + 1));
            return;
        }

        if (typeof item !== "string") return;
        const trimmed = item.trim();
        if (!trimmed) return;

        if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed !== trimmed) {
                    collect(parsed, depth + 1);
                    return;
                }
            } catch {
                const encodedValues = [...trimmed.matchAll(/"(?:\\.|[^"\\])*"/g)];
                if (encodedValues.length) {
                    encodedValues.forEach(([encodedValue]) => {
                        try {
                            collect(JSON.parse(encodedValue), depth + 1);
                        } catch {
                            // Ignore malformed fragments and keep valid cuisine names.
                        }
                    });
                    return;
                }
            }
        }

        trimmed.split(",").forEach(addCuisine);
    };

    collect(value);
    return cuisines;
};

const parseRestaurantInput = (body, imageName) => {
    let cuisines = body.cuisines;
    if (typeof cuisines === "string") {
        try {
            cuisines = JSON.parse(cuisines);
        } catch {
            cuisines = cuisines.split(",").map((value) => value.trim()).filter(Boolean);
        }
    }

    let address = body.address;
    if (typeof address === "string") {
        address = JSON.parse(address);
    }

    const value = {
        name: body.name?.trim(),
        description: body.description?.trim(),
        address,
        cuisines: normalizeCuisines(cuisines),
        phone: body.phone?.trim() || "",
        offerLabel: body.offerLabel?.trim() || "",
        openingHours: body.openingHours?.trim() || "",
        deliveryFee: Number(body.deliveryFee),
        minimumOrder: Number(body.minimumOrder),
        averageCostForTwo: Number(body.averageCostForTwo),
        deliveryTime: Number(body.deliveryTime),
        isActive: body.isActive === undefined ? true : body.isActive === "true" || body.isActive === true
    };

    if (imageName) value.image = imageName;
    return value;
};

export const listRestaurants = async (req, res) => {
    try {
        const { q = "", cuisine = "", location = "", maxCost, maxDelivery, vegetarian, offers, sort = "relevance", page = "1", limit = "24" } = req.query;
        const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
        const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 24));
        const filter = { isActive: true };

        if (q) {
            const expression = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            const matchingFoods = await foodModel.find({ name: expression, isAvailable: { $ne: false }, restaurantId: { $ne: null } }).distinct("restaurantId");
            filter.$or = [
                { name: expression },
                { description: expression },
                { cuisines: expression },
                ...(location ? [] : [{ "address.city": expression }]),
                { _id: { $in: matchingFoods } }
            ];
        }
        if (location) {
            const escapedLocation = String(location).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            if (/^\d{5,6}$/.test(escapedLocation)) {
                filter.$expr = {
                    $eq: [
                        { $trim: { input: { $toString: { $ifNull: ["$address.zipcode", ""] } } } },
                        escapedLocation
                    ]
                };
            } else {
                filter["address.city"] = new RegExp(escapedLocation, "i");
            }
        }
        if (cuisine) filter.cuisines = new RegExp(String(cuisine).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        if (maxCost && Number.isFinite(Number(maxCost))) filter.averageCostForTwo = { $lte: Number(maxCost) };
        if (maxDelivery && Number.isFinite(Number(maxDelivery))) filter.deliveryTime = { $lte: Number(maxDelivery) };
        if (offers === "true") filter.offerLabel = { $exists: true, $ne: "" };
        if (vegetarian === "true") {
            const vegetarianRestaurants = await foodModel.distinct("restaurantId", { vegetarian: true, isAvailable: { $ne: false }, restaurantId: { $ne: null } });
            filter._id = { $in: vegetarianRestaurants };
        }

        const sortOptions = {
            relevance: { createdAt: -1 },
            delivery: { deliveryTime: 1 },
            price: { averageCostForTwo: 1 },
            "price-desc": { averageCostForTwo: -1 }
        };
        const sortBy = sortOptions[sort] || sortOptions.relevance;

        const [restaurants, total, availableCuisines] = await Promise.all([
            restaurantModel.find(filter).sort(sortBy).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(),
            restaurantModel.countDocuments(filter),
            restaurantModel.distinct("cuisines", { isActive: true })
        ]);
        const ids = restaurants.map(({ _id }) => _id);
        const foodCounts = await foodModel.aggregate([
            { $match: { restaurantId: { $in: ids }, isAvailable: { $ne: false } } },
            { $group: { _id: "$restaurantId", count: { $sum: 1 } } }
        ]);
        const counts = new Map(foodCounts.map(({ _id, count }) => [String(_id), count]));
        return res.json({
            success: true,
            data: restaurants.map((restaurant) => ({
                ...restaurant,
                cuisines: normalizeCuisines(restaurant.cuisines),
                foodCount: counts.get(String(restaurant._id)) || 0
            })),
            pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) },
            filters: { cuisines: normalizeCuisines(availableCuisines).sort((a, b) => a.localeCompare(b)) }
        });
    } catch (error) {
        console.error("LIST RESTAURANTS ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load restaurants" });
    }
};

export const getRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id, isActive: true }).lean();
        if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
        const foods = await foodModel.find({ restaurantId: restaurant._id, isAvailable: { $ne: false } }).sort({ category: 1, name: 1 }).lean();
        return res.json({ success: true, data: { ...restaurant, cuisines: normalizeCuisines(restaurant.cuisines), foods } });
    } catch (error) {
        console.error("GET RESTAURANT ERROR:", error.message);
        return res.status(400).json({ success: false, message: "Invalid restaurant or unable to load its menu" });
    }
};

export const adminListRestaurants = async (_req, res) => {
    try {
        const restaurants = await restaurantModel.find({}).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: restaurants.map((restaurant) => ({
            ...restaurant,
            cuisines: normalizeCuisines(restaurant.cuisines)
        })) });
    } catch (error) {
        console.error("ADMIN LIST RESTAURANTS ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load restaurants" });
    }
};

export const createRestaurant = async (req, res) => {
    let imageName = req.file?.filename;
    try {
        if (!imageName) return res.status(400).json({ success: false, message: "Restaurant cover image is required" });
        const restaurant = await restaurantModel.create(parseRestaurantInput(req.body, imageName));
        return res.status(201).json({ success: true, data: restaurant, message: "Restaurant created" });
    } catch (error) {
        if (imageName) await fs.unlink(path.join(uploadDirectory, imageName)).catch(() => {});
        return res.status(400).json({ success: false, message: error.message || "Invalid restaurant details" });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const update = parseRestaurantInput(req.body, req.file?.filename);
        const restaurant = await restaurantModel.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
        return res.json({ success: true, data: restaurant, message: "Restaurant updated" });
    } catch (error) {
        if (req.file?.filename) await fs.unlink(path.join(uploadDirectory, req.file.filename)).catch(() => {});
        return res.status(400).json({ success: false, message: error.message || "Unable to update restaurant" });
    }
};

export const deactivateRestaurant = async (req, res) => {
    try {
        const restaurant = await restaurantModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
        return res.json({ success: true, message: "Restaurant deactivated" });
    } catch (error) {
        console.error("DEACTIVATE RESTAURANT ERROR:", error.message);
        return res.status(400).json({ success: false, message: "Unable to deactivate restaurant" });
    }
};
