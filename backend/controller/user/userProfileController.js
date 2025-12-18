import User from '../../models/userModel.js';
import Event from '../../models/eventModel.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import Post from '../../models/postModel.js';
import Registration from '../../models/registrationsModel.js';
import Comment from '../../models/commentModel.js';
import Like from '../../models/likeModel.js';
import Notification from '../../models/notificationModel.js';

// Helper function to format user data for frontend
async function formatUserResponse(user) {
  const userId = user._id;

  // Get stats from registrations and managed events
  const completedRegistrationsPromise = Registration.countDocuments({
    userId,
    status: 'completed',
  });

  // Count events where this user is the manager
  const managedEventsCountPromise = Event.countDocuments({
    managerId: userId,
    status: { $in: ['approved', 'completed'] },
  });

  const [completedRegistrations, managedEventsCount] = await Promise.all([
    completedRegistrationsPromise,
    managedEventsCountPromise,
  ]);

  // Calculate approximate hours (assuming 4 hours per event on average)
  const estimatedHours = completedRegistrations * 4;

  // Format joinedDate from createdAt
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).getFullYear().toString()
    : new Date().getFullYear().toString();

  return {
    _id: user._id,
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber,
    location: user.location || '',
    bio: user.bio || '',
    about: user.about || '',
    interests: user.interests || [],
    bookmarks: user.bookmarks || [],
    status: user.status,
    joinedDate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    stats: {
      events: completedRegistrations,
      hours: estimatedHours,
      hosts: managedEventsCount,
    },
  };
}

export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const formattedUser = await formatUserResponse(user);
    res.status(200).json({ success: true, user: formattedUser });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateUserProfile(req, res) {
  const {
    username,
    email,
    avatar,
    phoneNumber,
    location,
    bio,
    about,
    interests,
  } = req.body;
  try {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: 'Email already in use' });
    }

    const updateData = {
      username: username?.trim(),
      email: email?.trim().toLowerCase(),
      phoneNumber: phoneNumber?.trim(),
    };

    if (avatar) {
      updateData.avatar = avatar.trim();
    }

    if (location !== undefined) {
      updateData.location = location?.trim();
    }

    if (bio !== undefined) {
      updateData.bio = bio?.trim();
    }

    if (about !== undefined) {
      updateData.about = about?.trim();
    }

    if (interests !== undefined) {
      updateData.interests = Array.isArray(interests)
        ? interests.map((i) => i?.trim()).filter(Boolean)
        : [];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const formattedUser = await formatUserResponse(user);
    res.status(200).json({ success: true, user: formattedUser });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjectId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const userEvents = await Event.find({ managerId: userObjectId })
      .select('_id')
      .lean();
    const eventIds = userEvents.map((e) => e._id);

    const [eventPosts, userPosts] = await Promise.all([
      Post.find({ eventId: { $in: eventIds } })
        .select('_id')
        .lean(),
      Post.find({ author: userObjectId }).select('_id').lean(),
    ]);

    const allPostIds = [
      ...eventPosts.map((p) => p._id),
      ...userPosts.map((p) => p._id),
    ];
    const allPostIdsStr = allPostIds.map((id) => id.toString());

    const commentsByUserPosts = await Comment.find({
      postId: { $in: allPostIds },
    })
      .select('_id')
      .lean();
    const commentsByUserPostIds = commentsByUserPosts.map((c) => c._id);
    const commentsByUserPostIdsStr = commentsByUserPostIds.map((id) =>
      id.toString()
    );

    await Promise.all([
      Event.deleteMany({ managerId: userObjectId }),

      Post.deleteMany({
        $or: [{ eventId: { $in: eventIds } }, { author: userObjectId }],
      }),

      Comment.deleteMany({
        $or: [
          { eventId: { $in: eventIds } },
          { postId: { $in: allPostIds } },
          { author: userObjectId },
        ],
      }),

      Like.deleteMany({
        $or: [
          { userId: userObjectId },
          {
            likeableId: { $in: eventIds.map((id) => id.toString()) },
            likeableType: 'event',
          },
          { likeableId: { $in: allPostIdsStr }, likeableType: 'post' },
          {
            likeableId: { $in: commentsByUserPostIdsStr },
            likeableType: 'comment',
          },
        ],
      }),

      Registration.deleteMany({
        $or: [{ userId: userObjectId }, { eventId: { $in: eventIds } }],
      }),

      Notification.deleteMany({
        $or: [
          { sender: userObjectId },
          { recipient: userObjectId },
          { event: { $in: eventIds } },
          { post: { $in: allPostIds } },
        ],
      }),

      User.updateMany(
        { bookmarks: userObjectId },
        { $pull: { bookmarks: userObjectId } }
      ),
    ]);

    await User.findByIdAndDelete(userObjectId);

    res.status(200).json({
      success: true,
      message: 'User and all related data deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function changePassword(req, res) {
  const { current_password, new_password, confirm_new_password } = req.body;

  if (new_password !== confirm_new_password) {
    return res.status(400).json({
      success: false,
      message: 'New password and confirmation do not match',
    });
  }

  try {
    const user = await User.findById(req.user._id).select('password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Current password is incorrect' });
    }

    const isSameAsOld = await bcrypt.compare(new_password, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getUserById(req, res) {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const formattedUser = await formatUserResponse(user);
    res.status(200).json({ success: true, user: formattedUser });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getUserBookMarks(req, res) {
  try {
    const userId = req.user._id || req.user.id;

    const user = await User.findById(userId)
      .select('bookmarks')
      .populate({
        path: 'bookmarks',
        select:
          'name description managerId categories thumbnail images likesCount viewCount startDate endDate location capacity status createdAt',
        populate: [
          { path: 'managerId', select: 'username avatar' },
          { path: 'categories', select: 'name slug color description' },
        ],
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
