import jwt from "jsonwebtoken";

const authMiddleware = async (req,res,next) => {
    const rawToken = req.headers.token || req.headers.authorization;
    const tokenValue = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    const token = tokenValue && tokenValue.startsWith("Bearer ")
        ? tokenValue.slice(7)
        : tokenValue;

    if (!token) {
        return res.status(401).json({success:false,message:"Not Authorized Login Again"});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!req.body) {
            req.body = {};
        }

        req.body.userId = decoded.id || decoded._id;

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false,message:"Session expired, please login again"});
    }
}

export default authMiddleware;