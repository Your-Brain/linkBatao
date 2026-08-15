import Report from '../models/Report.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

// @desc    Get all pending reports for moderation queue
// @route   GET /api/admin/reports
// @access  Private (Admin/Moderator)
export const getPendingReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ status: 'PENDING' })
      .populate({
        path: 'resourceId',
        populate: { path: 'category', select: 'name' }
      })
      .populate('reporterId', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve or dismiss report
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin/Moderator)
export const resolveReport = async (req, res, next) => {
  try {
    const { action } = req.body; // 'RESOLVE' or 'DISMISS'
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (action === 'RESOLVE') {
      report.status = 'RESOLVED';
      report.resolvedAt = new Date();

      // If resolving report, also remove or unpublish the resource if requested
      if (req.body.removeResource) {
        await Resource.findByIdAndUpdate(report.resourceId, { status: 'REMOVED' });
      }
    } else {
      report.status = 'DISMISS';
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({
      success: true,
      message: `Report ${action.toLowerCase()}d successfully`,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get pending resources awaiting moderation
// @route   GET /api/admin/resources/pending
// @access  Private (Admin/Moderator)
export const getPendingResources = async (req, res, next) => {
  try {
    const pending = await Resource.find({ status: { $in: ['PENDING', 'REJECTED'] } })
      .populate('category', 'name')
      .populate('submittedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pending.length,
      data: pending
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resource moderation status
// @route   PATCH /api/admin/resources/:id
// @access  Private (Admin/Moderator)
export const updateResourceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED', 'REMOVED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.json({
      success: true,
      message: `Resource status updated to ${status}`,
      data: resource
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get platform stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin/Moderator)
export const getStats = async (req, res, next) => {
  try {
    const totalResources = await Resource.countDocuments({ status: 'APPROVED' });
    const pendingResources = await Resource.countDocuments({ status: 'PENDING' });
    const totalUsers = await User.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });
    const totalCategories = await Category.countDocuments();

    res.json({
      success: true,
      stats: {
        totalResources,
        pendingResources,
        totalUsers,
        pendingReports,
        totalCategories
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all resources for admin management
// @route   GET /api/admin/resources/all
// @access  Private (Admin/Moderator)
export const getAllResourcesAdmin = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .populate('category', 'name slug')
      .populate('submittedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Permanently delete any resource (Admin/Moderator)
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin/Moderator)
export const deleteResourceAdmin = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource permanently deleted'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Ban/Unban user account (Admin only)
// @route   PATCH /api/admin/users/:id/ban
// @access  Private (Admin)
export const toggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot ban an admin user' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User @${user.username} has been ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Permanently delete a user account (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin account' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: `User account @${user.username} permanently deleted`
    });
  } catch (err) {
    next(err);
  }
};


