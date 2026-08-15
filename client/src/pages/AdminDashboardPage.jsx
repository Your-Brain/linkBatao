import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { ShieldAlert, CheckCircle2, XCircle, Users, Flag, Layers, RefreshCw, Trash2, Edit3, Eye, EyeOff, Search, Link as LinkIcon, Ban, UserCheck, Shield, Sparkles } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('all-resources');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for All Links tab
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Modal State
  const [editingResource, setEditingResource] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, pendingRes, allRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/reports'),
        API.get('/admin/resources/pending'),
        API.get(`/admin/resources/all?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`),
        user?.role === 'ADMIN' ? API.get('/admin/users') : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
      if (pendingRes.data.success) setPendingResources(pendingRes.data.data);
      if (allRes.data.success) setAllResources(allRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      fetchAdminData();
    }
  }, [user, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">You must have Moderator or Administrator privileges to access this control panel.</p>
      </div>
    );
  }

  const handleResolveReport = async (reportId, action, removeResource = false) => {
    try {
      const res = await API.patch(`/admin/reports/${reportId}`, { action, removeResource });
      if (res.data.success) {
        showToast(`Report ${action.toLowerCase()}d!`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to resolve report', 'error');
    }
  };

  const handleUpdateResourceStatus = async (resourceId, status) => {
    try {
      const res = await API.patch(`/admin/resources/${resourceId}`, { status });
      if (res.data.success) {
        const actionLabel = status === 'APPROVED' ? 'Visible to users' : status === 'REMOVED' ? 'Hidden from users' : status;
        showToast(`Resource status updated: ${actionLabel}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update resource status', 'error');
    }
  };

  const handleDeleteResource = async (resourceId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await API.delete(`/admin/resources/${resourceId}`);
      if (res.data.success) {
        showToast('Resource permanently deleted', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete resource', 'error');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await API.patch(`/admin/users/${userId}/role`, { role });
      if (res.data.success) {
        showToast(`User role updated to ${role}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update user role', 'error');
    }
  };

  const handleToggleBanUser = async (userId, username, isCurrentlyBanned) => {
    const actionName = isCurrentlyBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${actionName} @${username}?`)) return;

    try {
      const res = await API.patch(`/admin/users/${userId}/ban`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${actionName} user`, 'error');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE user account @${username}? This action cannot be undone.`)) return;

    try {
      const res = await API.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast(`User @${username} deleted successfully`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Administrator Command Center</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Platform Moderation & Full Administration
          </h1>
          <p className="text-xs text-slate-400">Full control over link resources, moderation queue, user roles, bans, and system safety.</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2.5 rounded-xl bg-dark-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors shrink-0 flex items-center gap-2 text-xs font-semibold"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Counter Cards (ALL CLICKABLE TO SWITCH TABS & FILTERS) */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Active Resources -> Filter Approved */}
          <button
            onClick={() => {
              setActiveTab('all-resources');
              setStatusFilter('APPROVED');
            }}
            className={`glass-card p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
              activeTab === 'all-resources' && statusFilter === 'APPROVED'
                ? 'border-sky-500/80 bg-sky-500/10 shadow-glow'
                : 'border-slate-800 hover:border-sky-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Active Resources</p>
              <LinkIcon className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">{stats.totalResources}</p>
            <p className="text-[10px] text-sky-300/70 mt-1 font-medium">Click to view active links →</p>
          </button>

          {/* Card 2: Pending Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`glass-card p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
              activeTab === 'reports'
                ? 'border-rose-500/80 bg-rose-500/10 shadow-glow'
                : 'border-slate-800 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Pending Reports</p>
              <Flag className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{stats.pendingReports}</p>
            <p className="text-[10px] text-rose-300/70 mt-1 font-medium">Click to view reports →</p>
          </button>

          {/* Card 3: Moderation Queue */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`glass-card p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
              activeTab === 'pending'
                ? 'border-amber-500/80 bg-amber-500/10 shadow-glow'
                : 'border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Moderation Queue</p>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pendingResources}</p>
            <p className="text-[10px] text-amber-300/70 mt-1 font-medium">Click to review pending →</p>
          </button>

          {/* Card 4: Total Accounts */}
          <button
            onClick={() => user.role === 'ADMIN' && setActiveTab('users')}
            className={`glass-card p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] cursor-pointer ${
              activeTab === 'users'
                ? 'border-purple-500/80 bg-purple-500/10 shadow-glow'
                : 'border-slate-800 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">Total Accounts</p>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{stats.totalUsers}</p>
            <p className="text-[10px] text-purple-300/70 mt-1 font-medium">Click to manage users →</p>
          </button>

        </div>
      )}

      {/* Control Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all-resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all-resources'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4 text-sky-400" />
          <span>All Links & Control</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>Link Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Pending Submissions ({pendingResources.length})</span>
        </button>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>User Manager & Bans ({usersList.length})</span>
          </button>
        )}
      </div>

      {/* ALL LINKS MANAGEMENT TAB */}
      {activeTab === 'all-resources' && (
        <div className="space-y-4">
          
          {/* Search & Status Filter Controls */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-96">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, URL or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-dark-900 border border-slate-700 text-white text-xs focus:border-sky-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs shrink-0 hover:bg-sky-400"
              >
                Search
              </button>
            </form>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'All Statuses' },
                { id: 'APPROVED', label: 'APPROVED (Active)' },
                { id: 'REMOVED', label: 'REMOVED (Hidden)' },
                { id: 'PENDING', label: 'PENDING' },
                { id: 'REJECTED', label: 'REJECTED' }
              ].map(statusOpt => (
                <button
                  key={statusOpt.id}
                  onClick={() => setStatusFilter(statusOpt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === statusOpt.id
                      ? 'bg-sky-500 text-slate-950 font-bold shadow'
                      : 'bg-dark-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {statusOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 text-left">
            {allResources.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No links matching the current filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead className="bg-dark-800 text-slate-400 uppercase font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title & Destination</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Submitted By</th>
                      <th className="p-3">Visibility Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allResources.map((resItem) => {
                      const isHidden = resItem.status === 'REMOVED' || resItem.status === 'REJECTED';
                      return (
                        <tr key={resItem._id} className="hover:bg-dark-800/40">
                          <td className="p-3 space-y-0.5 max-w-xs">
                            <a
                              href={`/resources/${resItem._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-white hover:text-sky-300 truncate block"
                            >
                              {resItem.title}
                            </a>
                            <p className="text-[11px] text-slate-400 truncate">{resItem.url}</p>
                          </td>

                          <td className="p-3 text-slate-300">
                            {resItem.category?.name || 'Uncategorized'}
                          </td>

                          <td className="p-3 text-slate-400">
                            {resItem.submittedBy ? `@${resItem.submittedBy.username}` : 'Anonymous'}
                          </td>

                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              resItem.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : resItem.status === 'REMOVED'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : resItem.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              {resItem.status === 'APPROVED' ? 'VISIBLE' : resItem.status === 'REMOVED' ? 'HIDDEN' : resItem.status}
                            </span>
                          </td>

                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            
                            {/* Edit Link */}
                            <button
                              onClick={() => setEditingResource(resItem)}
                              className="px-2.5 py-1.5 rounded-lg bg-dark-700 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 transition-colors inline-flex items-center gap-1"
                              title="Edit Link Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Hide / Unhide Toggle */}
                            <button
                              onClick={() => handleUpdateResourceStatus(resItem._id, resItem.status === 'APPROVED' ? 'REMOVED' : 'APPROVED')}
                              className={`px-2.5 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1 ${
                                isHidden
                                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                              }`}
                              title={isHidden ? 'Show / Unhide link to users' : 'Hide link from users'}
                            >
                              {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{isHidden ? 'Unhide' : 'Hide'}</span>
                            </button>

                            {/* Delete Permanently */}
                            <button
                              onClick={() => handleDeleteResource(resItem._id, resItem.title)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors inline-flex items-center gap-1"
                              title="Permanently Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>

                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LINK REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 text-left">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No pending link reports. All clear!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-slate-300">
                <thead className="bg-dark-800 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Resource Title</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-dark-800/40">
                      <td className="p-3 font-semibold text-rose-400">{report.reason}</td>
                      <td className="p-3 font-medium text-white max-w-xs truncate">
                        {report.resourceId ? report.resourceId.title : 'Deleted Resource'}
                      </td>
                      <td className="p-3 text-slate-400 max-w-sm truncate">{report.description || 'N/A'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleResolveReport(report._id, 'RESOLVE', false)}
                          className="px-3 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleResolveReport(report._id, 'RESOLVE', true)}
                          className="px-3 py-1 rounded bg-rose-500 text-white font-bold hover:bg-rose-600"
                        >
                          Remove Resource
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PENDING SUBMISSIONS QUEUE TAB */}
      {activeTab === 'pending' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 text-left">
          {pendingResources.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No resources currently pending review.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {pendingResources.map((resItem) => (
                <div key={resItem._id} className="p-4 flex items-center justify-between gap-4 hover:bg-dark-800/40">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold uppercase">
                      {resItem.status}
                    </span>
                    <h4 className="font-bold text-white text-sm">{resItem.title}</h4>
                    <p className="text-xs text-slate-400">{resItem.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateResourceStatus(resItem._id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateResourceStatus(resItem._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* USER MANAGER & BAN CONTROL TAB (ADMIN ONLY) */}
      {activeTab === 'users' && user.role === 'ADMIN' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 text-left">
          <div className="p-4 border-b border-slate-800 bg-dark-900/50 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Registered User Accounts & Access Controls</span>
            </h3>
            <span className="text-xs text-slate-400">Total Users: {usersList.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead className="bg-dark-800 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Role Assignment & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => {
                  const isBanned = u.isBanned;
                  return (
                    <tr key={u._id} className="hover:bg-dark-800/40">
                      <td className="p-3 font-semibold text-white">@{u.username}</td>
                      <td className="p-3 text-slate-400">{u.email}</td>
                      
                      {/* Role Badge */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : u.role === 'MODERATOR' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Account Status Badge */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBanned ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {isBanned ? 'SUSPENDED / BANNED' : 'ACTIVE'}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        
                        {/* Role Change Buttons */}
                        {['USER', 'MODERATOR', 'ADMIN'].map(roleOption => (
                          <button
                            key={roleOption}
                            disabled={u.role === roleOption}
                            onClick={() => handleRoleChange(u._id, roleOption)}
                            className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
                              u.role === roleOption ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-dark-700 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {roleOption}
                          </button>
                        ))}

                        {/* Ban / Unban Toggle Button */}
                        <button
                          onClick={() => handleToggleBanUser(u._id, u.username, isBanned)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors inline-flex items-center gap-1 ${
                            isBanned
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          }`}
                          title={isBanned ? 'Unban User Account' : 'Ban User Account'}
                        >
                          {isBanned ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                          <span>{isBanned ? 'Unban' : 'Ban'}</span>
                        </button>

                        {/* Delete User Account Button */}
                        <button
                          onClick={() => handleDeleteUser(u._id, u.username)}
                          disabled={u.role === 'ADMIN'}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors inline-flex items-center gap-1 ${
                            u.role === 'ADMIN'
                              ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          }`}
                          title="Permanently Delete User Account"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditResourceModal
        isOpen={!!editingResource}
        onClose={() => setEditingResource(null)}
        resource={editingResource}
        onResourceUpdated={() => fetchAdminData()}
      />

    </div>
  );
};
