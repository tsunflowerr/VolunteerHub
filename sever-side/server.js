import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import {connectDB} from "./config/db.js";
import webpush from 'web-push';
import redisClient from './config/redis.js';
import routes from './routes/index.js';

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

// CORS configuration - QUAN TRỌNG cho cookies
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // URL của frontend
    credentials: true // Cho phép gửi cookies
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Thêm cookie parser middleware

await redisClient.connect(); 

connectDB()

webpush.setVapidDetails(
  'mailto:tot23032@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Welcome route
app.get("/", (req, res) => {
    res.send("Welcome to VolunteerHub API");
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

