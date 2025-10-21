import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import {connectDB} from "./config/db.js";
import webpush from 'web-push';
import redisClient from './config/redis.js';

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

await redisClient.connect(); 

connectDB()

webpush.setVapidDetails(
  'mailto:tot23032@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.get("/", (req, res) => {
    res.send("Welcome to the API");
    }
);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

