import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"


export async function authMiddleware(req, res, next) {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please login."
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(payload._id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.status === "locked") {
            return res.status(403).json({
                success: false,
                message: "User account is locked"
            });
        }
        
        req.user = user;
        next();

    } catch (err) {
        console.error("[AUTH MIDDLEWARE ERROR] Token verification failed:", err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}