import User from "../../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"
const JWT_EXPIRES_IN = "24h"
const JWT_EXPIRES_MS = 24 * 60 * 60 * 1000 

/**
 * Tạo JWT token cho user
 * @param {String} userId - MongoDB ObjectId của user
 * @returns {String} JWT token
 */
const createToken = (userId) => {
    return jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Cấu hình và gửi token qua cookie
 * @param {Object} res - Express response object
 * @param {String} token - JWT token
 */
const setCookieToken = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,        
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax',    
        maxAge: JWT_EXPIRES_MS
    });
}


export async function registerUser(req, res) {
    const { username, email, phone_number, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { phone_number }]
        }).select('email phone_number');

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Email already in use" 
                });
            }
            if (existingUser.phone_number === phone_number) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Phone number already in use" 
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            phone_number,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=random`
        });

        const token = createToken(newUser._id);

        setCookieToken(res, token);

        console.log(`[AUTH] New user registered: ${email} (ID: ${newUser._id})`);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: token, // Thêm token vào response để dễ test với Swagger
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                phone_number: newUser.phone_number,
                role: newUser.role,
                status: newUser.status
            }
        });

    } catch (err) {
        console.error("[AUTH ERROR] Registration failed:", err);
        
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "Email or phone number already exists" 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Server error during registration" 
        });
    }
}


export async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        if (user.status === "locked") {
            console.warn(`[AUTH] Locked account attempted login: ${email}`);
            return res.status(403).json({ 
                success: false, 
                message: "Your account has been locked. Please contact administrator." 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const token = createToken(user._id);

        setCookieToken(res, token);

        console.log(`[AUTH] User logged in: ${email} (ID: ${user._id})`);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token, // Thêm token vào response để dễ test với Swagger
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                phone_number: user.phone_number,
                role: user.role,
                status: user.status
            }
        });

    } catch (err) {
        console.error("[AUTH ERROR] Login failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
}


export async function logoutUser(req, res) {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (err) {
        console.error("[AUTH ERROR] Logout failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during logout" 
        });
    }
}

export async function getCurrentUser(req, res) {
    try {
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar,
                phone_number: req.user.phone_number,
                role: req.user.role,
                status: req.user.status
            }
        });
    } catch (err) {
        console.error("[AUTH ERROR] Get current user failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
}
