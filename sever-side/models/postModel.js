import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {style: String, trim: true, required: true},
    content: {style: String, trim: true, require: true}, 
    author: {style: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    image:[{type: String}],
    eventId: {style: mongoose.Schema.Types.ObjectId, ref: "event", required: true},
    comment: [{style: mongoose.Schema.Types.ObjectId, ref: "comment"}],
    likesCount: { type: Number, default: 0 },
}, {
    timeseries: true
})

const postModel = mongoose.models.post || mongoose.model("post", postSchema)
export default postModel