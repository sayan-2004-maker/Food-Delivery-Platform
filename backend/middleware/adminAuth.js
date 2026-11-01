import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
    const rawToken = req.headers.authorization || req.headers.token || "";
    const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

    if (!token) {
        return res.status(401).json({ success: false, message: "Admin sign-in is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Admin access is required" });
        }
        req.admin = decoded;
        return next();
    } catch {
        return res.status(401).json({ success: false, message: "Admin session expired. Please sign in again." });
    }
};

export default adminAuth;
