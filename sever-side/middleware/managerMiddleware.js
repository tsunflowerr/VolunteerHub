export  async function managerMiddleware(req, res, next) {
    if(!req.user || !req.user.role || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
        return res.status(403).json({success: false, message: 'Access denied. Managers only.'});
    }
    next();
}