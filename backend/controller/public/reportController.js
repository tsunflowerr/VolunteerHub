import Report from '../../models/reportModel.js';
import Post from '../../models/postModel.js';
import Comment from '../../models/commentModel.js';
import User from '../../models/userModel.js';
import Event from '../../models/eventModel.js';

// Create a new report
export async function createReport(req, res) {
  try {
    const { type, targetId, reason, description } = req.body;

    // Validate type
    if (!['post', 'comment', 'user', 'event'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    // Validate reason
    const validReasons = [
      'spam',
      'harassment',
      'hate_speech',
      'violence',
      'inappropriate_content',
      'misinformation',
      'other',
    ];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: 'Invalid reason' });
    }

    // Check if target exists and get the author/reported user
    let target = null;
    let reportedUserId = null;

    if (type === 'post') {
      target = await Post.findById(targetId).select('author');
      if (!target) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      reportedUserId = target.author;
    } else if (type === 'comment') {
      target = await Comment.findById(targetId).select('author');
      if (!target) {
        return res.status(404).json({ success: false, message: 'Comment not found' });
      }
      reportedUserId = target.author;
    } else if (type === 'user') {
      target = await User.findById(targetId).select('_id');
      if (!target) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      reportedUserId = target._id;
    } else if (type === 'event') {
      target = await Event.findById(targetId).select('managerId');
      if (!target) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }
      reportedUserId = target.managerId;
    }

    // Prevent self-reporting
    if (reportedUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot report your own content' });
    }

    // Check if user already reported this content
    const existingReport = await Report.findOne({
      reporter: req.user._id,
      type,
      targetId,
      status: { $in: ['pending', 'reviewed'] },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content',
      });
    }

    // Create the report
    const report = new Report({
      reporter: req.user._id,
      reportedUser: reportedUserId,
      type,
      targetId,
      reason,
      description: description?.trim(),
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      report: {
        _id: report._id,
        type: report.type,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
}

// Get user's own reports
export async function getMyReports(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [reports, total] = await Promise.all([
      Report.find({ reporter: req.user._id })
        .select('type reason status createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments({ reporter: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
}
