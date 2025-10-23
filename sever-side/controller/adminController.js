import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import { Parser } from 'json2csv';

export async function getAllUsersAndManagers(req, res) {
    try {
        // Find All users and managers
        const users = await User.find({ role: { $in: ['user', 'manager'] } }).select('-password');
        if(!users || users.length === 0) {
            return  res.status(404).json({ success: false, message: "No users or managers found" });
        }
        res.status(200).json({success: true, users})
    }
    catch(err) {
        console.error("Error fetching users and managers:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function toggleUserLockStatus(req, res) {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: "Cannot lock admin accounts" });
        }
        user.status = user.status === "locked" ? "active" : "locked";
        await user.save();
        res.status(200).json({ success: true, message: "User lock status updated", user });
    }
    catch(err) {
        console.error("Error toggling user lock status:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


export async function exportUsersData(req, res) {
    try {
        const {format = 'json', role, status} = req.query;
        const filter = {};
        if(role) {
            filter.role = role;
        }
        if(status) {
            filter.status = status;
        }
        const users = await User.find(filter).select('-password -pushSubscription').lean();
        if(!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "No users found for the specified criteria" });
        }

        const formattedData = users.map(user => ({
            ID: user._id,
            Username: user.username,
            Email: user.email,
            Role: user.role,
            Status: user.status,
            Phone: user.phone_number,
            CreatedAt: user.createdAt,
            UpdatedAt: user.updatedAt
        }));

        if(format === 'csv') {
            const parser = new Parser();
            const csv = parser.parse(formattedData);
            const fileName = `users_export_${new Date().toISOString()}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.status(200).send(csv);
        }
        else { // default to json
            const fileName = `users_export_${new Date().toISOString()}.json`;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.status(200).json(formattedData);
        }
    }
    catch(err) {
        console.error("Error exporting users data:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const exportEvents = async (req, res) => {
  try {
    const { format = 'json', status, category } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (category) filters.category = category; 

    const events = await Event.find(filters)
      .populate('managerId', 'username email')
      .populate('category', 'name')
      .lean();

    const formattedData = events.map(event => ({
      ID: event._id,
      Event: event.name,
      Status: event.status,
      Location: event.location,
      StartDate: event.startDate,
      EndDate: event.endDate,
      Capacity: event.capacity,
      ViewCount: event.viewCount,
      LikesCount: event.likesCount,
      Manager: event.managerId ? event.managerId.username : 'N/A',
      ManagerEmail: event.managerId ? event.managerId.email : 'N/A',
      Categories: event.category.map(cat => cat.name).join(', '),
      CreatedAt: event.createdAt,
    }));

    // 6. Trả về file
    if (format.toLowerCase() === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(formattedData);
      const fileName = `events_export_${new Date().toISOString()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).send(csv);
    } else {
      const fileName = `events_export_${new Date().toISOString()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).json(formattedData);
    }

  } catch (error) {
    console.error('Lỗi khi xuất dữ liệu sự kiện:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};