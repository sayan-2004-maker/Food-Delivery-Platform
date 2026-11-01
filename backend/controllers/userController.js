import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const handleAuthError = (res, error, action) => {
    if (error.code === 11000) {
        return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    if (
        error.name === "MongooseServerSelectionError" ||
        error.name === "MongoNetworkError" ||
        error.name === "MongoNetworkTimeoutError" ||
        (error.name === "MongooseError" && error.message.includes("buffering timed out"))
    ) {
        console.error(`${action} database error:`, error.message);
        return res.status(503).json({
            success: false,
            message: "The database is temporarily unavailable. Check the backend database connection and try again."
        });
    }

    console.error(`${action} error:`, error.message);
    return res.status(500).json({
        success: false,
        message: "Unable to complete authentication right now. Please try again."
    });
};

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
            .select("name email phone deliveryAddress")
            .lean();

        if (!user) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        let address = user.deliveryAddress || {};
        let phone = user.phone || "";
        if (!address.zipcode && !address.city) {
            const latestOrder = await orderModel.findOne({ userId: String(user._id) })
                .sort({ createdAt: -1 })
                .select("address")
                .lean();
            if (latestOrder?.address) {
                address = latestOrder.address;
                phone = phone || address.phone || "";
            }
        }

        return res.json({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                phone,
                address
            }
        });
    } catch (error) {
        return handleAuthError(res, error, "Profile lookup");
    }
};

// =========================
// LOGIN
// =========================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await userModel.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = createToken(user._id);

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return handleAuthError(res, error, "Login");
    }
};


// =========================
// REGISTER
// =========================
const registerUser = async (req, res) => {
    try {
        const { name, password, email } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        if (!validator.isEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const exists = await userModel.findOne({
            email: cleanEmail
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name: name.trim(),
            email: cleanEmail,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        return res.json({
            success: true,
            token
        });

    } catch (error) {
        return handleAuthError(res, error, "Registration");
    }
};


export {
    loginUser,
    registerUser,
    getProfile
};