import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connect to MongoDB")
    }
    catch(err) {
        console.error("Failed to connect MongoDB:", err.message)
        process.exit(1)
    }
}