import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    postId: {type: mongoose.Schema.Types.ObjectId, ref: "post", required: true},
    eventId: {type: mongoose.Schema.Types.ObjectId, ref: "event", required: true},
    content: {type: String, required: true, trim: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    parentComment: {type: mongoose.Schema.Types.ObjectId, ref: "comment", default: null},
}, {
    timestamps: true
});

commentSchema.index({postId: 1, createdAt: -1});
commentSchema.index({postId: 1, parentComment: 1});
commentSchema.index({parentComment: 1});
commentSchema.index({author: 1});

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;