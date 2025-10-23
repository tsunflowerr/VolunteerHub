import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"
export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({message: "Authorization header missing or malformed"})
    }

    const token  = authHeader.split(" ")[1]

    try {
        const payload = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(payload._id).select('-password')
        if(!user) {
            return res.status(401).json({success: false, message: "User not found"})
        }
        if(user.status === "locked") {
            return res.status(403).json({success: false, message: "User account is locked"})
        }
        req.user = user
        next()
    }
    catch(err) {
        console.error("Error verifying token:", err);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}