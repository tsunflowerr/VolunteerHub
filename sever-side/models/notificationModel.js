import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    type: {
        type: String,
        enum: ["like", "comment", "cancelled", "confirmed", "completed", "registration_confirmation", "new_registration", "comment_reply", "new_post"],
        required: true
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post", default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "event", default: null },
    isRead: { type: Boolean, default: false },
    content: { type: String, required: true },

}, {
    timestamps: true
});
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
const NotificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default NotificationModel;