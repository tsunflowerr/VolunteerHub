import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import {connectDB} from "./config/db.js";

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

connectDB()

app.get("/", (req, res) => {
    res.send("Welcome to the API");
    }
);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

