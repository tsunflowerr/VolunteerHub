import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export async function optionalAuthMiddleware(req, res, next) {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next();
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(payload._id).select('_id role'); // Minimal select
        
        if (user && user.status !== "locked") {
            req.user = user;
        }
    } catch (err) {
        // Ignore errors for optional auth
    }
    
    next();
}
