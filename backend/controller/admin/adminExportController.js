import User from "../../models/userModel.js";
import Event from "../../models/eventModel.js";
import { Parser } from 'json2csv';

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
            Phone: user.phoneNumber || '',
            Location: user.location || '',
            Bio: user.bio || '',
            CreatedAt: user.createdAt,
            UpdatedAt: user.updatedAt
        }));

        if(format === 'csv') {
            const parser = new Parser({
                fields: ['ID', 'Username', 'Email', 'Role', 'Status', 'Phone', 'Location', 'Bio', 'CreatedAt', 'UpdatedAt'],
                header: true,
                delimiter: ',',
                quote: '"',
                escapedQuote: '""',
                excelStrings: false
            });
            const csv = parser.parse(formattedData);
            const fileName = `users_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            // Add BOM for Excel UTF-8 support
            res.status(200).send('\ufeff' + csv);
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
    if (category) filters.categories = category; 

    const events = await Event.find(filters)
      .populate('managerId', 'username email')
      .populate('categories', 'name')
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
      Categories: event.categories ? event.categories.map(cat => cat.name).join(', ') : 'N/A',
      CreatedAt: event.createdAt,
    }));

    // 6. Trả về file
    if (format.toLowerCase() === 'csv') {
      const parser = new Parser({
        fields: ['ID', 'Event', 'Status', 'Location', 'StartDate', 'EndDate', 'Capacity', 'ViewCount', 'LikesCount', 'Manager', 'ManagerEmail', 'Categories', 'CreatedAt'],
        header: true,
        delimiter: ',',
        quote: '"',
        escapedQuote: '""',
        excelStrings: false
      });
      const csv = parser.parse(formattedData);
      const fileName = `events_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      // Add BOM for Excel UTF-8 support
      res.status(200).send('\ufeff' + csv);
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
