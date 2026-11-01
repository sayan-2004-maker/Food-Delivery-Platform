import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        description: { type: String, required: true, trim: true, maxlength: 1200 },
        image: { type: String, required: true },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            zipcode: { type: String, default: "", trim: true }
        },
        cuisines: { type: [String], required: true, validate: [(values) => values.length > 0, "Add at least one cuisine"] },
        offerLabel: { type: String, default: "", trim: true, maxlength: 120 },
        phone: { type: String, default: "", trim: true },
        openingHours: { type: String, default: "", trim: true },
        deliveryFee: { type: Number, min: 0, default: 0 },
        minimumOrder: { type: Number, min: 0, default: 0 },
        averageCostForTwo: { type: Number, min: 0, default: 0 },
        deliveryTime: { type: Number, min: 1, default: 35 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const restaurantModel =
    mongoose.models.restaurant ||
    mongoose.model("restaurant", restaurantSchema);

export default restaurantModel;
