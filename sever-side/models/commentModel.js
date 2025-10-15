import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: {type: mongoose.Schema.Types.ObjectId, ref: "post", required: true}, 
    author: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    content: {type: String, required: true},
    parentId : {type: mongoose.Schema.Types.ObjectId, ref: "comment", default: null},
    likesCount: { type: Number, default: 0 },
}, {
    timeseries: true
})

const commentModel = mongoose.model("comment", commentSchema)
export default commentModel