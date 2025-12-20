import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'manager', 'admin'], default: 'user' },
    avatar: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
          this.username
        )}&background=random`;
      },
    },
    phoneNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 100 },
    about: { type: String, trim: true, maxlength: 500 },
    interests: [{ type: String, trim: true }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'event' }],
    pushSubscription: {
      type: Object,
      default: null,
    },
    status: { type: String, enum: ['active', 'locked'], default: 'active' },
    // Gamification fields - references to UserProgress for detailed info
    // These are denormalized for quick access
    gamification: {
      currentLevel: { type: Number, default: 1, min: 1 },
      totalPoints: { type: Number, default: 0, min: 0 },
      achievementCount: { type: Number, default: 0, min: 0 },
      // Featured achievements to display on profile (max 5)
      featuredAchievements: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'achievementDefinition' 
      }]
    }
  },
  {
    timestamps: true,
  }
);

// Text search index for username and email
userSchema.index({ username: 'text', email: 'text' });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
