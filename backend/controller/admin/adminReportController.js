import Report from '../../models/reportModel.js';
import User from '../../models/userModel.js';
import Post from '../../models/postModel.js';
import Comment from '../../models/commentModel.js';
import Like from '../../models/likeModel.js';
import Notification from '../../models/notificationModel.js';
import { invalidateCacheByPattern } from '../../utils/cacheHelper.js';
import {
  createAndSendNotification,
  generateNotificationContent,
} from '../../utils/notificationHelper.js';

// Get all reports with pagination and filtering
export async function getReports(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // pending, reviewed, resolved, dismissed
    const type = req.query.type; // post, comment

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'username email avatar')
        .populate('reportedUser', 'username email avatar status')
        .populate('reviewedBy', 'username email avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Populate target content for each report
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        let targetContent = null;
        if (report.type === 'post') {
          targetContent = await Post.findById(report.targetId)
            .populate('author', 'username avatar')
            .select('title content image eventId')
            .lean();
        } else if (report.type === 'comment') {
          targetContent = await Comment.findById(report.targetId)
            .populate('author', 'username avatar')
            .select('content postId eventId')
            .lean();
        }
        return { ...report, targetContent };
      })
    );

    res.status(200).json({
      success: true,
      reports: populatedReports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
}

// Get report by ID
export async function getReportById(req, res) {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reporter', 'username email avatar')
      .populate('reportedUser', 'username email avatar status')
      .populate('reviewedBy', 'username email avatar')
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Populate target content
    let targetContent = null;
    if (report.type === 'post') {
      targetContent = await Post.findById(report.targetId)
        .populate('author', 'username avatar')
        .populate('eventId', 'name')
        .select('title content image eventId createdAt')
        .lean();
    } else if (report.type === 'comment') {
      targetContent = await Comment.findById(report.targetId)
        .populate('author', 'username avatar')
        .populate('postId', 'title')
        .populate('eventId', 'name')
        .select('content postId eventId createdAt')
        .lean();
    }

    res.status(200).json({
      success: true,
      report: { ...report, targetContent },
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
}

// Review report (update status and take action)
export async function reviewReport(req, res) {
  try {
    const { id } = req.params;
    const { status, action, adminNote } = req.body;

    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Update report
    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    if (adminNote) report.adminNote = adminNote;
    if (action) report.action = action;

    // Take action based on the decision
    if (status === 'resolved' && action) {
      switch (action) {
        case 'content_removed':
          await removeContent(report.type, report.targetId);
          break;
        case 'user_warned':
          // Send warning notification to user
          await createAndSendNotification(
            {
              recipient: report.reportedUser,
              sender: req.user._id,
              type: 'warning',
              content: `Your ${report.type} has been flagged for violating community guidelines. Please review our policies.`,
            },
            {
              title: 'Content Warning',
              body: `Your ${report.type} has been flagged for violating community guidelines.`,
            }
          );
          break;
        case 'user_banned':
          // Lock the user account
          await User.findByIdAndUpdate(report.reportedUser, { status: 'locked' });
          // Also remove the content
          await removeContent(report.type, report.targetId);
          break;
      }
    }

    await report.save();

    // Populate for response
    await report.populate([
      { path: 'reporter', select: 'username email avatar' },
      { path: 'reportedUser', select: 'username email avatar status' },
      { path: 'reviewedBy', select: 'username email avatar' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Report reviewed successfully',
      report,
    });
  } catch (error) {
    console.error('Error reviewing report:', error);
    res.status(500).json({ success: false, message: 'Failed to review report' });
  }
}

// Helper function to remove content
async function removeContent(type, targetId) {
  if (type === 'post') {
    const post = await Post.findById(targetId);
    if (post) {
      // Delete associated comments and likes
      const commentIds = await Comment.find({ postId: targetId }).distinct('_id');

      await Promise.all([
        Comment.deleteMany({ postId: targetId }),
        Like.deleteMany({
          $or: [
            { likeableId: targetId.toString(), likeableType: 'post' },
            { likeableId: { $in: commentIds.map((id) => id.toString()) }, likeableType: 'comment' },
          ],
        }),
        Notification.deleteMany({ post: targetId }),
        Post.findByIdAndDelete(targetId),
      ]);

      // Invalidate cache
      await invalidateCacheByPattern('posts:*');
    }
  } else if (type === 'comment') {
    const comment = await Comment.findById(targetId);
    if (comment) {
      // Delete child comments and likes
      const childComments = await Comment.find({ parentComment: targetId }).distinct('_id');
      const allCommentIds = [targetId, ...childComments];

      await Promise.all([
        Like.deleteMany({
          likeableId: { $in: allCommentIds.map((id) => id.toString()) },
          likeableType: 'comment',
        }),
        Comment.deleteMany({
          $or: [{ _id: targetId }, { parentComment: targetId }],
        }),
      ]);

      // Update post comment count
      const totalDeleted = allCommentIds.length;
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentsCount: -totalDeleted },
      });
    }
  }
}

// Get report statistics
export async function getReportStats(req, res) {
  try {
    const [pending, reviewed, resolved, dismissed, total] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'reviewed' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'dismissed' }),
      Report.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        pending,
        reviewed,
        resolved,
        dismissed,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report stats' });
  }
}

// Delete report
export async function deleteReport(req, res) {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
}
