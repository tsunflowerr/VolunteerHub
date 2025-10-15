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
    status: { type: String, enum: ["draft","pending","approved","rejected","cancelled"], default: "pending" },
    startDate:{type: Date, required: true},
    endDate:{type: Date, required:true},
    likesCount: { type: Number, default: 0 },
    viewCount: {type: Number, default: 0}
}, {
    timestamps: true
})

const eventModel = mongoose.models.event || mongoose.model("event", eventSchema);

export default eventModel