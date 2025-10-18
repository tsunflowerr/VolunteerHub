import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    content: {type: String, trim: true, required: true}, 
    author: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    image: [{type: String}],
    eventId: {type: mongoose.Schema.Types.ObjectId, ref: "event", required: true},
    commentsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
}, {
    timestamps: true
})

const postModel = mongoose.models.post || mongoose.model("post", postSchema)
export default postModel