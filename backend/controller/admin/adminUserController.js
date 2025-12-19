import User from '../../models/userModel.js';
import { invalidateCache } from '../../utils/cacheHelper.js';
import bcrypt from 'bcrypt';
export async function getAllUsersAndManagers(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  try {
    // Find All users and managers
    const [users, total] = await Promise.all([
      User.find({ role: { $in: ['user', 'manager'] } })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments({ role: { $in: ['user', 'manager'] } }),
    ]);
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No users or managers found' });
    }
    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error('Error fetching users and managers:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function toggleUserLockStatus(req, res) {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Cannot lock admin accounts' });
    }
    user.status = user.status === 'locked' ? 'active' : 'locked';
    await user.save();
    
    // Invalidate admin dashboard cache (user active/locked count updated)
    await invalidateCache('dashboard:admin');
    
    res
      .status(200)
      .json({ success: true, message: 'User lock status updated', user });
  } catch (err) {
    console.error('Error toggling user lock status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createUser(req, res) {
  const { username, email, phoneNumber, password, role } = req.body;

  try {
    // Check if email or phone number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    }).select('email phoneNumber');

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use',
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username || 'User'
      )}&background=random`,
    });

    console.log(
      `[ADMIN] New user created by admin: ${email} (ID: ${newUser._id}, Role: ${role})`
    );

    // Invalidate admin dashboard cache (user count updated)
    await invalidateCache('dashboard:admin');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (err) {
    console.error('[ADMIN ERROR] User creation failed:', err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during user creation',
    });
  }
}
