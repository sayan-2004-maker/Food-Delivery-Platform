import mongoose from "mongoose";

export const connectDB = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    const mongoUri = !isProduction
        ? process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/food_delivery"
        : process.env.MONGO_URI;

    if (!mongoUri) {
        throw new Error("MONGO_URI must be configured for production");
    }

    try {
        const connection = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
            bufferCommands: false
        });

        console.log("DB Connected");
        console.log("MongoDB Host:", connection.connection.host);

    } catch (error) {
        console.log("DB Error:", error.message);
        throw error;
    }
};