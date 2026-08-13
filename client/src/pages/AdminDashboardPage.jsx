import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, CheckCircle2, XCircle, Users, Flag, Layers, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('reports');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, pendingRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/reports'),
        API.get('/admin/resources/pending'),
        user?.role === 'ADMIN' ? API.get('/admin/users') : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
      if (pendingRes.data.success) setPendingResources(pendingRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load admin moderation queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      fetchAdminData();
    }
  }, [user]);

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
        showToast(`Resource status set to ${status}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast('Failed to update resource status', 'error');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 flex items-center justify-between gap-4 text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Moderation Queue & Platform Governance
          </h1>
          <p className="text-xs text-slate-400">Review link reports, manage user roles, and resolve suspicious submissions.</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-dark-800 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Analytics Counter Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-left">
            <p className="text-xs text-slate-400">Active Resources</p>
            <p className="text-2xl font-extrabold text-sky-400 mt-1">{stats.totalResources}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-left">
            <p className="text-xs text-slate-400">Pending Reports</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{stats.pendingReports}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-left">
            <p className="text-xs text-slate-400">Moderation Queue</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pendingResources}</p>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-slate-800 text-left">
            <p className="text-xs text-slate-400">Total Accounts</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {/* Control Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reports'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>Pending Link Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Manage Users ({usersList.length})</span>
          </button>
        )}
      </div>

      {/* Reports Table */}
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

      {/* Pending Submissions Queue */}
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

      {/* Users Manager (Admin Only) */}
      {activeTab === 'users' && user.role === 'ADMIN' && (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-300">
              <thead className="bg-dark-800 text-slate-400 uppercase font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-dark-800/40">
                    <td className="p-3 font-semibold text-white">@{u.username}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : u.role === 'MODERATOR' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      {['USER', 'MODERATOR', 'ADMIN'].map(roleOption => (
                        <button
                          key={roleOption}
                          disabled={u.role === roleOption}
                          onClick={() => handleRoleChange(u._id, roleOption)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                            u.role === roleOption ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500' : 'bg-dark-700 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {roleOption}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
