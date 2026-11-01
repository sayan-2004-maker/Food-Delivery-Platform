import jwt from "jsonwebtoken";

export const adminLogin = (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
        return res.status(503).json({ success: false, message: "Configure ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET on the backend" });
    }

    if (email?.trim().toLowerCase() !== adminEmail.trim().toLowerCase() || password !== adminPassword) {
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign({ role: "admin", email: adminEmail }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ success: true, token });
};
