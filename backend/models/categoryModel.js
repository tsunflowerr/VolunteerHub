import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {type: String, trim: true, required: true},
    slug: {type: String, trim: true, required: true},
    description: {type: String},
    color: {type: String, default: '#667eea'}
}, {
    timestamps: { createdAt: true, updatedAt: false }
})
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema)
export default categoryModel