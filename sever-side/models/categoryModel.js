import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {style: String, trim: true, required: true},
    slug: {style: String, trim: true, required: true},
    description: {type: String}
}, {
    timestamps: { createdAt: true, updatedAt: false }
})
categorySchema.index({ name: 1 }, { unique: true });
const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema)
export default categoryModel