import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: ['post', 'comment', 'user', 'event'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type',
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'hate_speech',
        'violence',
        'inappropriate_content',
        'misinformation',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    reviewedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: ['none', 'content_removed', 'user_warned', 'user_banned'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ type: 1, targetId: 1 });

const reportModel =
  mongoose.models.report || mongoose.model('report', reportSchema);

export default reportModel;
