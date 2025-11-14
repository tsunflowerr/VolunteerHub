import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, trim: true},
    email: {type:String, required: true, unique: true, trim: true, lowercase: true},
    password: {type: String, required: true},
    role: { type: String, enum: ["user", "manager", "admin"], default: "user" },
    avatar : { type: String, default: function() {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.username)}&background=random`;
    } },
    phone_number: {type: String, trim: true},
    bookmarks: [{type: mongoose.Schema.Types.ObjectId, ref: "event"}],
    pushSubscription: {
        type: Object,
        default: null
    },
    status: {type: String, enum: ["active", "locked"], default: "active"}
}, {
    timestamps: true
});

// Text search index for username and email
userSchema.index({ username: 'text', email: 'text' });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
