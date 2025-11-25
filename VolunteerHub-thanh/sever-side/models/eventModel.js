import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    description: {type: String, required: true},
    managerId: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    category:[{type: mongoose.Schema.Types.ObjectId, ref:"category"}],
    location:{type: String, required: true},
    thumbnail: {type: String},
    images: [{ type: String }],
    capacity: {type: Number, required: true},
    status: { type: String, enum: ["pending","approved","rejected","cancelled", "completed"], default: "pending" },
    startDate:{type: Date, required: true},
    endDate:{type: Date, required:true},
    likesCount: { type: Number, default: 0, min: 0 },
    viewCount: {type: Number, default: 0, min: 0},
    registrationsCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true
})

eventSchema.index({ status: 1, startDate: 1 });      // For upcoming events
eventSchema.index({ status: 1, endDate: 1 });        // For trending events
eventSchema.index({ managerId: 1, status: 1 });      // For manager queries
eventSchema.index({ category: 1, status: 1 });       // For category queries
eventSchema.index({ createdAt: -1 });      
eventSchema.index({ name: 'text', description: 'text', location: 'text' });  // For text search      

const eventModel = mongoose.models.event || mongoose.model("event", eventSchema);

export default eventModel