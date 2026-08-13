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
