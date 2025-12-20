import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    description: {type: String, required: true},
    managerId: {type: mongoose.Schema.Types.ObjectId, ref:"user", required: true},
    categories:[{type: mongoose.Schema.Types.ObjectId, ref:"category"}],
    activities: { type: String },
    prepare: { type: String },
    location:{type: String, required: true},
    thumbnail: {type: String},
    images: [{ type: String }],
    capacity: {type: Number, required: true},
    status: { type: String, enum: ["pending","approved","rejected","cancelled", "completed"], default: "pending" },
    startDate:{type: Date, required: true},
    endDate:{type: Date, required:true},
    likesCount: { type: Number, default: 0, min: 0 },
    viewCount: {type: Number, default: 0, min: 0},
    registrationsCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },
    
    // Gamification - Rewards khi hoàn thành sự kiện
    rewards: {
        // Điểm thưởng khi hoàn thành sự kiện này
        pointsReward: { type: Number, default: 10, min: 0 },
        // Số giờ tình nguyện được tính cho sự kiện này
        hoursCredit: { type: Number, default: 4, min: 0 },
        // Achievement có thể nhận được khi hoàn thành (do manager chọn)
        availableAchievements: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'achievementDefinition' 
        }],
        // Bonus điểm đặc biệt (VD: sự kiện khó, sự kiện quan trọng)
        bonusPoints: { type: Number, default: 0, min: 0 },
        bonusReason: { type: String, trim: true }
    },
    
    // Requirements - Yêu cầu để đăng ký sự kiện
    requirements: {
        // Có yêu cầu hay không
        hasRequirements: { type: Boolean, default: false },
        // Level tối thiểu
        minLevel: { type: Number, default: 1, min: 1 },
        // Điểm tối thiểu
        minPoints: { type: Number, default: 0, min: 0 },
        // Achievement bắt buộc phải có
        requiredAchievements: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'achievementDefinition' 
        }],
        // Số sự kiện đã hoàn thành tối thiểu
        minEventsCompleted: { type: Number, default: 0, min: 0 },
        // Mô tả yêu cầu (hiển thị cho user)
        requirementDescription: { type: String, trim: true }
    }
}, {
    timestamps: true
})

eventSchema.index({ status: 1, startDate: 1 });      // For upcoming events
eventSchema.index({ status: 1, endDate: 1 });        // For trending events
eventSchema.index({ managerId: 1, status: 1 });      // For manager queries
eventSchema.index({ categories: 1, status: 1 });       // For category queries
eventSchema.index({ createdAt: -1 });      
eventSchema.index({ name: 'text', description: 'text', location: 'text' });  // For text search      

const eventModel = mongoose.models.event || mongoose.model("event", eventSchema);

export default eventModel