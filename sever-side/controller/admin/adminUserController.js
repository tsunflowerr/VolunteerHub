import User from "../../models/userModel.js";

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
