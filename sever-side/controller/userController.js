import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
import validator from "validator"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import Post from "../models/postModel.js"
import Registration from "../models/registrationsModel.js"
import Comment from "../models/commentModel.js"
import Like from "../models/likeModel.js"
import Notification from "../models/notificationModel.js"


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"
const JWT_EXPIRES_IN = "24h"

const createToken = (userId) => {
    return jwt.sign({_id: userId}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})
}

export async function registerUser(req, res) {
    const {username, email, phone_number, password, confirm_password} = req.body;
    if(!username || !email || !phone_number || !password || !confirm_password) {
        return res.status(400).json({success: false, message: "All fields are required"})
    }
    if(!validator.isEmail(email)) {
        return res.status(400).json({success: false, message:"Invalid email format"})
    }
    if(password.length < 6) {
        return res.status(400).json({success: false, message: "password must be at least 6 characters long"})
    }
    if(!validator.isMobilePhone(phone_number)) {
        return res.status(400).json({success: false, message: "Invalid phone number format"})
    }
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
        const newUser = await User.create({username, email, password: hashpassword, avatar:`https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=random`}, phone_number)
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
    if(!email || !password) {
        return res.status(400).json({success: false, message: "All fields are required"})
    }
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

export async function getUserProfile(req, res) {
    try {
        const user = await User.findById(req.user._id).select("-password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error fetching user profile:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function updateUserProfile(req, res) {
    const {username, email, avatar, phone_number} = req.body
    if(!username || !email || !phone_number) {
        return res.status(400).json({success: false, message: "All fields are required"})
    }
    if(email && !validator.isEmail(email)) {
        return res.status(400).json({success: false, message:"Invalid email format"})
    }
    if(phone_number && !validator.isMobilePhone(phone_number)) {
        return res.status(400).json({success: false, message: "Invalid phone number format"})
    }
    try {
        const existingUser = await User.findOne({email, _id: {$ne: req.user._id}})
        if(existingUser) {
            return res.status(400).json({success: false, message: "Email already in use"})
        }
        const user = await User.findByIdAndUpdate(req.user._id, {username, email, avatar, phone_number}, {new: true}).select("-password")
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error updating user profile:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function deleteUser(req, res) {
    try {
        const userId = req.user._id
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const deleteUser = await User.findByIdAndDelete(userObjectId)
        if(!deleteUser) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        //Xóa các bài viết của User
        await Post.deleteMany({author: userObjectId})
        //Xóa các đăng ký của User
        await Registration.deleteMany({userId: userObjectId})
        //Xóa các bình luận của User
        await Comment.deleteMany({author: userObjectId})
        //Xóa các like của User
        await Like.deleteMany({userId: userObjectId})
        //Xóa các thông báo của User
        await Notification.deleteMany({sender: userObjectId})
        res.status(200).json({success: true, message: "User deleted successfully"})
    } catch(err) {
        console.error("Error deleting user:", err)
        res.status(500).json({success:false, message:"Server error"})
    }

}

export async function changePassword(req, res) {
    const {current_password, new_password, confirm_new_password} = req.body
    if(!current_password || !new_password || !confirm_new_password) {
        return res.status(400).json({success: false, message: "All fields are required"})
    }
    if(new_password !== confirm_new_password) {
        return res.status(400).json({success: false, message: "New password and confirmation do not match"})
    }
    if(new_password.length < 6) {
        return res.status(400).json({success: false, message: "New password must be at least 6 characters long"})
    }
    try {
        const user = await User.findById(req.user._id).select("password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        const isMatch = await bcrypt.compare(current_password, user.password)
        if(!isMatch) {
            return res.status(400).json({success: false, message: "Current password is incorrect"})
        }
        user.password = await bcrypt.hash(new_password, 10)
        await user.save()
        res.status(200).json({success: true, message: "Password changed successfully"})
    } catch(err) {
        console.error("Error changing password:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function getUserById(req, res) {
    const userId = req.params.id
    try {
        const user = await User.findById(userId).select("-password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error fetching user:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function getUserBookMarks(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId)
        .select('bookmarks')
        .populate({
            path: 'bookmarks',
            select: "name description managerId category thumbnail images likesCount viewCount startDate endDate location capacity status createdAt",
            populate: [
                { path: 'managerId', select: 'username avatar' },
                { path: 'category', select: 'name slug' }
            ]
        });
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        res.status(200).json({success:true, bookmarks: user.bookmarks});
    }
    catch(error) {
        console.log('Error fetching user bookmarks:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function addRemoveBookMark(req, res) {
    try {
        const userId = req.user.id || req.user._id;
        const eventId = req.body.eventId;
        if(!eventId) {
            return res.status(400).json({success:false, message:"Event is required"})
        }
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        const isBookmarked = user.bookmarks.some(b => b.toString() === eventId);
        if(isBookmarked) {
            user.bookmarks = user.bookmarks.filter(b => b.toString() !== eventId);
            await user.save();
            return res.status(200).json({success:true, type:"Remove", message:"Removed bookmark successfully"})
        }
        else {
            user.bookmarks.push(eventId);
            await user.save();
            return res.status(200).json({success:true, type:"Add", message:"Added bookmark successfully"})
        }
    }
    catch(error) {
        console.log('Error adding bookmark:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}