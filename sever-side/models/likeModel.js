import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    likeableId: {type: String, required: true},
    likeableType: {type: String, enum:['event', 'post', 'comment'], required: true}
}, {
    timestamps: { createdAt: true, updatedAt: false }
})

likeSchema.index(
  { userId: 1, likeableId: 1, likeableType: 1 },
  { unique: true }
);
likeSchema.index({ likeableId: 1, likeableType: 1 });
const likeModel = mongoose.model("like", likeSchema)
export default likeModel