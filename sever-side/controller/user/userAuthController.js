import User from "../../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"
const JWT_EXPIRES_IN = "24h"

const createToken = (userId) => {
    return jwt.sign({_id: userId}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}

export async function registerUser(req, res) {
    const {username, email, phone_number, password, confirm_password} = req.body;
    if(password.toString() !== confirm_password.toString()) {
        return res.status(400).json({success: false, message: "Password and Confirm password do not match"})
    }
    try {
        if(await User.findOne({email})) {
            return res.status(400).json({success: false, message: "Email already in use"})
        }   
        if(await User.findOne({phone_number})) {
            return res.status(400).json({success: false, message: "Phone already in use"})
        }

        const hashpassword = await bcrypt.hash(password,10)
        const newUser = await User.create({
            username, 
            email, 
            password: hashpassword, 
            phone_number,
            avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=random`
        })
        const token = createToken(newUser._id)
        res.status(201).json({
            success: true, 
            token, 
            newUser: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                phone_number: newUser.phone_number
            }
        })
    } catch(err) {
        console.error("Error registering user:", err),
        res.status(500).json({success:false, message:"Sever error"})
    }
}

export async function loginUser(req, res) {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({success: false, message: "User not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({success: false, message: "Invalid credentials"})
        }
        const token = createToken(user._id)
        res.status(200).json({
            success: true, 
            token, 
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                phone_number: user.phone_number
            }
        })
    } catch(err) {
        console.error("Error logging in user:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}
