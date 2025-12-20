import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    type: {
        type: String,
        enum: [
            "like",                      
            "comment",                  
            "comment_reply",            
            "new_post",                  
            "event_status_update",       
            "registration_status_update",
            "achievement_earned",        // Khi user nhận được achievement
            "level_up",                  // Khi user lên level mới
            "points_earned"              // Khi user nhận được points
        ],
        required: true
    },
    relatedStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "cancelled", "completed", "confirmed"],
        default: null 
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "post", default: null },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "event", default: null },
    isRead: { type: Boolean, default: false },
    content: { type: String, required: true },

}, {
    timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, relatedStatus: 1 });

const NotificationModel = mongoose.models.notification || mongoose.model("notification", notificationSchema);
export default NotificationModel;