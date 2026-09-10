import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { EditCollectionModal } from '../components/collections/EditCollectionModal';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceRow } from '../components/resources/ResourceRow';
import { CollectionCard } from '../components/collections/CollectionCard';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Flag, 
  Layers, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Search, 
  Link as LinkIcon, 
  Ban, 
  UserCheck, 
  Shield, 
  Sparkles,
  LayoutGrid,
  List,
  Table as TableIcon,
  ShieldCheck,
  Plus,
  Save,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Lock,
  FileText,
  AlertOctagon,
  AlertTriangle,
  Globe,
  FolderHeart,
  FolderPlus,
  FolderEdit,
  Folder
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Lock', label: 'Lock (Security / Privacy)' },
  { value: 'ShieldCheck', label: 'Shield Check (Safety)' },
  { value: 'Shield', label: 'Shield (Protection)' },
  { value: 'ExternalLink', label: 'External Link (Indexing / Embedding)' },
  { value: 'AlertOctagon', label: 'Alert Octagon (DMCA / Infringement)' },
  { value: 'FileText', label: 'File Text (Terms & Security)' },
  { value: 'AlertTriangle', label: 'Alert Triangle (Warnings)' },
  { value: 'CheckCircle2', label: 'Check Circle (Guarantees)' },
  { value: 'Globe', label: 'Globe (Web / Network)' }
];

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('all-resources');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'grid', 'list'
  const [userViewMode, setUserViewMode] = useState('table'); // 'table', 'grid', 'list'
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state for All Links tab
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Search & Filter state for Vaults/Collections tab
  const [vaultSearchTerm, setVaultSearchTerm] = useState('');
  const [vaultVisibilityFilter, setVaultVisibilityFilter] = useState('ALL');
  const [vaultViewMode, setVaultViewMode] = useState('table');
  const [editingCollection, setEditingCollection] = useState(null);

  // Edit Modal State
  const [editingResource, setEditingResource] = useState(null);

  // Dynamic Policy State
  const [policyData, setPolicyData] = useState({
    title: 'Privacy Policy & Safety Guarantees',
    badge: 'Security, Privacy & Content Integrity Policy',
    subtitle: 'Last updated: August 2026. Learn how AuraLink protects your privacy and handles untrusted external links safely.',
    sections: []
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, pendingRes, allRes, collectionsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/reports'),
        API.get('/admin/resources/pending'),
        API.get(`/admin/resources/all?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`),
        API.get(`/admin/collections?visibility=${vaultVisibilityFilter}&search=${encodeURIComponent(vaultSearchTerm)}`),
        user?.role === 'ADMIN' ? API.get('/admin/users') : Promise.resolve({ data: { success: true, data: [] } })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (reportsRes.data.success) setReports(reportsRes.data.data);
      if (pendingRes.data.success) setPendingResources(pendingRes.data.data);
      if (allRes.data.success) setAllResources(allRes.data.data);
      if (collectionsRes.data.success) setAllCollections(collectionsRes.data.data);
      if (usersRes.data.success) setUsersList(usersRes.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicyData = async () => {
    try {
      const res = await API.get('/policies/privacy-safety');
      if (res.data.success && res.data.data) {
        setPolicyData(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load policy data', err);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'MODERATOR')) {
      fetchAdminData();
      fetchPolicyData();
    }
  }, [user, statusFilter, vaultVisibilityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleVaultSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4 bg-[#0d081e] rounded-3xl border border-purple-900/40 p-8 hud-bracket">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-display font-bold text-white">Access Denied</h2>
        <p className="text-xs font-mono text-purple-300/70">You must have Moderator or Administrator privileges to access this control panel.</p>
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

  const handleDeleteCollectionAdmin = async (colId, colName) => {
    if (!window.confirm(`Are you sure you want to permanently delete Vault "${colName}"?`)) return;

    try {
      const res = await API.delete(`/admin/collections/${colId}`);
      if (res.data.success) {
        showToast(res.data.message || 'Vault deleted successfully', 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete vault', 'error');
    }
  };

  const handleToggleVaultVisibility = async (colId, currentVisibility) => {
    const newVisibility = currentVisibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    try {
      const res = await API.put(`/admin/collections/${colId}`, { visibility: newVisibility });
      if (res.data.success) {
        showToast(`Vault visibility updated to ${newVisibility}`, 'success');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update vault visibility', 'error');
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

  // Policy Editor Methods
  const handleAddPolicySection = () => {
    const newSection = {
      title: `${(policyData.sections?.length || 0) + 1}. New Policy Section`,
      icon: 'ShieldCheck',
      content: 'Write the details, guarantees, or rules for this section here...'
    };
    setPolicyData({
      ...policyData,
      sections: [...(policyData.sections || []), newSection]
    });
  };

  const handleUpdatePolicySection = (index, field, value) => {
    const updatedSections = [...(policyData.sections || [])];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicyData({ ...policyData, sections: updatedSections });
  };

  const handleRemovePolicySection = (index) => {
    const updatedSections = policyData.sections.filter((_, i) => i !== index);
    setPolicyData({ ...policyData, sections: updatedSections });
  };

  const handleMovePolicySection = (index, direction) => {
    const sections = [...(policyData.sections || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    setPolicyData({ ...policyData, sections });
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSavingPolicy(true);
    try {
      const res = await API.put('/admin/policies/privacy-safety', policyData);
      if (res.data.success) {
        showToast('Privacy & Safety Policy updated dynamically!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save policy updates', 'error');
    } finally {
      setSavingPolicy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left hud-bracket shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 text-purple-300 text-xs font-mono font-semibold border border-purple-500/30">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>Administrator Command Center</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Platform Moderation & Full Administration
          </h1>
          <p className="text-xs font-mono text-purple-300/70">Full control over link resources, data vaults, moderation queue, user roles, bans, and dynamic policy guarantees.</p>
        </div>

        <button
          onClick={() => {
            fetchAdminData();
            fetchPolicyData();
          }}
          className="px-4 py-2.5 rounded-xl bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 border border-purple-900/40 hover:border-purple-500 transition-all shrink-0 flex items-center gap-2 text-xs font-mono font-medium cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Counter Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Active Resources */}
          <button
            onClick={() => {
              setActiveTab('all-resources');
              setStatusFilter('APPROVED');
            }}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer hud-bracket ${
              activeTab === 'all-resources' && statusFilter === 'APPROVED'
                ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                : 'bg-[#0d081e] border-purple-900/40 hover:border-purple-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-purple-300/70">Active Links</p>
              <LinkIcon className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-purple-300 mt-1">{stats.totalResources}</p>
            <p className="text-[11px] font-mono text-purple-400/60 mt-1 font-medium">View active links →</p>
          </button>

          {/* Card 2: Collections */}
          <button
            onClick={() => setActiveTab('vaults')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer hud-bracket ${
              activeTab === 'vaults'
                ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                : 'bg-[#0d081e] border-purple-900/40 hover:border-purple-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-purple-300/70">Collections</p>
              <FolderHeart className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-purple-300 mt-1">{stats.totalCollections || allCollections.length || 0}</p>
            <p className="text-[11px] font-mono text-purple-400/60 mt-1 font-medium">Manage collections →</p>
          </button>

          {/* Card 3: Reports Queue */}
          <button
            onClick={() => setActiveTab('reports')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer hud-bracket ${
              activeTab === 'reports'
                ? 'border-rose-500/80 bg-rose-500/20 shadow-sm'
                : 'bg-[#0d081e] border-purple-900/40 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-purple-300/70">Open Reports</p>
              <Flag className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{stats.pendingReports}</p>
            <p className="text-[11px] font-mono text-purple-400/60 mt-1 font-medium">Moderate reports →</p>
          </button>

          {/* Card 4: Pending Review */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer hud-bracket ${
              activeTab === 'pending'
                ? 'border-amber-500/80 bg-amber-500/20 shadow-sm'
                : 'bg-[#0d081e] border-purple-900/40 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-purple-300/70">Pending Review</p>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.pendingResources}</p>
            <p className="text-[11px] font-mono text-purple-400/60 mt-1 font-medium">Review submissions →</p>
          </button>

          {/* Card 5: Total Users */}
          <button
            onClick={() => {
              if (user.role === 'ADMIN') setActiveTab('users');
            }}
            className={`p-4 rounded-3xl border text-left transition-all hud-bracket ${
              user.role === 'ADMIN' ? 'cursor-pointer' : 'cursor-default'
            } ${
              activeTab === 'users'
                ? 'border-purple-500 bg-purple-600/20 shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                : 'bg-[#0d081e] border-purple-900/40 hover:border-purple-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-purple-300/70">Total Users</p>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold font-mono text-purple-300 mt-1">{stats.totalUsers}</p>
            <p className="text-[11px] font-mono text-purple-400/60 mt-1 font-medium">
              {user.role === 'ADMIN' ? 'Manage user roles →' : 'Registered users'}
            </p>
          </button>

        </div>
      )}

      {/* Control Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-purple-900/30 pb-3">
        <button
          onClick={() => setActiveTab('all-resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'all-resources'
              ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm font-bold'
              : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <LinkIcon className="w-4 h-4 text-purple-400" />
          <span>All Resources ({allResources.length})</span>
        </button>

        {/* Collections Tab */}
        <button
          onClick={() => setActiveTab('vaults')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'vaults'
              ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm font-bold'
              : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <FolderHeart className="w-4 h-4 text-purple-400" />
          <span>Collections ({allCollections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold'
              : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4 text-rose-400" />
          <span>Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
              : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Pending Submissions ({pendingResources.length})</span>
        </button>

        {/* Dynamic Privacy & Safety Policy Tab */}
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold'
              : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Policy Editor</span>
        </button>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600/25 text-purple-200 border border-purple-500/50 shadow-sm font-bold'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>User Management ({usersList.length})</span>
          </button>
        )}
      </div>

      {/* DATA VAULTS / COLLECTIONS MANAGEMENT TAB */}
      {activeTab === 'vaults' && (
        <div className="space-y-4 text-left">
          
          {/* Search, Filter & View Controls */}
          <div className="bg-[#0d081e] p-4 rounded-3xl border border-purple-900/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 hud-bracket">
            
            {/* Search Input */}
            <form onSubmit={handleVaultSearchSubmit} className="flex items-center gap-2 w-full lg:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search vaults by name, description, owner..."
                  value={vaultSearchTerm}
                  onChange={(e) => setVaultSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shrink-0 cursor-pointer shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Quick Visibility Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Vaults' },
                { id: 'PUBLIC', label: 'PUBLIC (Visible)' },
                { id: 'PRIVATE', label: 'PRIVATE (Hidden)' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setVaultVisibilityFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    vaultVisibilityFilter === opt.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#07040f] p-1 rounded-xl border border-purple-900/40 self-end lg:self-center shrink-0">
              <button
                onClick={() => setVaultViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  vaultViewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setVaultViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  vaultViewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
            </div>

          </div>

          {/* Vaults Content Rendering */}
          {allCollections.length === 0 ? (
            <div className="bg-[#0d081e] p-12 text-center text-purple-300/70 text-xs font-mono rounded-3xl border border-purple-900/40 hud-bracket">
              No Data Vaults matching the current criteria.
            </div>
          ) : vaultViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allCollections.map((col) => (
                <div key={col._id} className="relative group">
                  <CollectionCard collection={col} />
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#07040f]/95 p-1 rounded-xl border border-purple-900/50 shadow-xl">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingCollection(col);
                      }}
                      className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-600/20 transition-colors"
                      title="Edit Vault"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteCollectionAdmin(col._id, col.name);
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/20 transition-colors"
                      title="Delete Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 shadow-xl hud-bracket">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-purple-200">
                  <thead className="bg-[#07040f] text-purple-300/70 uppercase font-mono border-b border-purple-900/30">
                    <tr>
                      <th className="p-3.5 text-left">Vault Name & Description</th>
                      <th className="p-3.5 text-left">Curated By</th>
                      <th className="p-3.5 text-left">Items Count</th>
                      <th className="p-3.5 text-left">Visibility</th>
                      <th className="p-3.5 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20 font-mono">
                    {allCollections.map((col) => {
                      const isPrivate = col.visibility === 'PRIVATE';
                      const itemsCount = col.items ? col.items.length : 0;
                      return (
                        <tr key={col._id} className="hover:bg-[#140d2e]/50 transition-colors">
                          <td className="p-3.5 space-y-0.5 max-w-xs text-left">
                            <Link
                              to={`/collections/${col._id}`}
                              className="font-bold text-white hover:text-purple-300 truncate block font-display"
                            >
                              {col.name}
                            </Link>
                            {col.description && (
                              <p className="text-[11px] text-purple-400/70 truncate">{col.description}</p>
                            )}
                          </td>

                          <td className="p-3.5 text-left text-purple-200">
                            {col.ownerId ? (
                              <span className="text-purple-300 font-mono">@{col.ownerId.username}</span>
                            ) : (
                              <span className="text-purple-400/50">Anonymous</span>
                            )}
                          </td>

                          <td className="p-3.5 text-left">
                            <span className="px-2.5 py-1 rounded-lg bg-[#07040f] border border-purple-900/40 text-purple-200">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </span>
                          </td>

                          <td className="p-3.5 text-left">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 border ${
                              isPrivate
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-purple-600/15 text-purple-300 border-purple-500/30'
                            }`}>
                              {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                              <span>{col.visibility}</span>
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            
                            {/* View Vault Link */}
                            <Link
                              to={`/collections/${col._id}`}
                              className="px-2.5 py-1.5 rounded-xl bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 hover:text-white border border-purple-900/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Explore Vault Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View</span>
                            </Link>

                            {/* Edit Vault */}
                            <button
                              onClick={() => setEditingCollection(col)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#140d2e] hover:bg-purple-600/20 text-purple-200 hover:text-white border border-purple-900/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Vault Parameters"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Toggle Public / Private */}
                            <button
                              onClick={() => handleToggleVaultVisibility(col._id, col.visibility)}
                              className={`px-2.5 py-1.5 rounded-xl border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                isPrivate
                                  ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border-purple-500/40'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                              }`}
                              title={isPrivate ? 'Make Vault Public' : 'Make Vault Private'}
                            >
                              {isPrivate ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>{isPrivate ? 'Make Public' : 'Make Private'}</span>
                            </button>

                            {/* Delete Permanently */}
                            <button
                              onClick={() => handleDeleteCollectionAdmin(col._id, col.name)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Permanently Delete Vault"
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
            </div>
          )}

        </div>
      )}

      {/* ALL LINKS MANAGEMENT TAB */}
      {activeTab === 'all-resources' && (
        <div className="space-y-4 text-left">
          
          {/* Search, Filter & View Mode Controls */}
          <div className="bg-[#0d081e] p-4 rounded-3xl border border-purple-900/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 hud-bracket">
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, URL or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs shrink-0 cursor-pointer shadow-sm"
              >
                Search
              </button>
            </form>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'APPROVED', label: 'APPROVED (Active)' },
                { id: 'REMOVED', label: 'REMOVED (Hidden)' },
                { id: 'PENDING', label: 'PENDING' },
                { id: 'REJECTED', label: 'REJECTED' }
              ].map(statusOpt => (
                <button
                  key={statusOpt.id}
                  onClick={() => setStatusFilter(statusOpt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    statusFilter === statusOpt.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40'
                  }`}
                >
                  {statusOpt.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher: Table / Grid / List */}
            <div className="flex items-center bg-[#07040f] p-1 rounded-xl border border-purple-900/40 self-end lg:self-center shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Table View (Data Grid)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Grid View (Visual Cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="List View (Horizontal Rows)"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

          </div>

          {/* Resources Content Rendering (Table vs Grid vs List) */}
          {allResources.length === 0 ? (
            <div className="bg-[#0d081e] p-12 text-center text-purple-300/70 text-xs font-mono rounded-3xl border border-purple-900/40 hud-bracket">
              No links matching the current filter.
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allResources.map((resItem) => (
                <ResourceCard
                  key={resItem._id}
                  resource={resItem}
                  onResourceDeleted={() => fetchAdminData()}
                />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            /* LIST VIEW */
            <div className="space-y-3">
              {allResources.map((resItem) => (
                <ResourceRow
                  key={resItem._id}
                  resource={resItem}
                  onResourceDeleted={() => fetchAdminData()}
                />
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 text-left shadow-xl hud-bracket">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-purple-200">
                  <thead className="bg-[#07040f] text-purple-300/70 uppercase font-mono border-b border-purple-900/30">
                    <tr>
                      <th className="p-3.5 text-left">Title & Destination</th>
                      <th className="p-3.5 text-left">Category</th>
                      <th className="p-3.5 text-left">Submitted By</th>
                      <th className="p-3.5 text-left">Visibility Status</th>
                      <th className="p-3.5 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20 font-mono">
                    {allResources.map((resItem) => {
                      const isHidden = resItem.status === 'REMOVED' || resItem.status === 'REJECTED';
                      return (
                        <tr key={resItem._id} className="hover:bg-[#140d2e]/50 transition-colors">
                          <td className="p-3.5 space-y-0.5 max-w-xs text-left">
                            <a
                              href={`/resources/${resItem._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-white hover:text-purple-300 truncate block font-display"
                            >
                              {resItem.title}
                            </a>
                            <p className="text-[11px] text-purple-400/70 truncate">{resItem.url}</p>
                          </td>

                          <td className="p-3.5 text-left text-purple-200">
                            {resItem.category?.name || 'Uncategorized'}
                          </td>

                          <td className="p-3.5 text-left text-purple-300/70">
                            {resItem.submittedBy ? `@${resItem.submittedBy.username}` : 'Anonymous'}
                          </td>

                          <td className="p-3.5 text-left">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              resItem.status === 'APPROVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : resItem.status === 'REMOVED'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : resItem.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-[#140d2e] text-purple-400 border-purple-900/40'
                            }`}>
                              {resItem.status === 'APPROVED' ? 'VISIBLE' : resItem.status === 'REMOVED' ? 'HIDDEN' : resItem.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            
                            {/* Edit Link */}
                            <button
                              onClick={() => setEditingResource(resItem)}
                              className="px-2.5 py-1.5 rounded-xl bg-[#140d2e] hover:bg-purple-600/20 text-purple-200 hover:text-white border border-purple-900/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Edit Link Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Hide / Unhide Toggle */}
                            <button
                              onClick={() => handleUpdateResourceStatus(resItem._id, resItem.status === 'APPROVED' ? 'REMOVED' : 'APPROVED')}
                              className={`px-2.5 py-1.5 rounded-xl border transition-colors inline-flex items-center gap-1 cursor-pointer ${
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
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors inline-flex items-center gap-1 cursor-pointer"
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
            </div>
          )}
        </div>
      )}

      {/* LINK REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 text-left shadow-xl hud-bracket">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-purple-300/70 text-xs font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>No pending reports. All clear!</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-purple-200">
                <thead className="bg-[#07040f] text-purple-300/70 uppercase font-mono border-b border-purple-900/30">
                  <tr>
                    <th className="p-3.5 text-left">Target Resource</th>
                    <th className="p-3.5 text-left">Reason</th>
                    <th className="p-3.5 text-left">Details</th>
                    <th className="p-3.5 text-left">Reported By</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 font-mono">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-[#140d2e]/50 transition-colors">
                      <td className="p-3.5 space-y-0.5 text-left">
                        <p className="font-bold text-white truncate max-w-xs">{report.resourceId?.title || 'Unknown'}</p>
                        <p className="text-[11px] text-purple-400/70 truncate max-w-xs">{report.resourceId?.url || ''}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-rose-400">{report.reason}</td>
                      <td className="p-3.5 max-w-xs truncate text-purple-300/70">{report.description || 'No comment provided'}</td>
                      <td className="p-3.5 text-purple-300/70">
                        {report.reporterId ? `@${report.reporterId.username}` : 'Anonymous'}
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleResolveReport(report._id, 'RESOLVE', true)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                        >
                          Remove Resource
                        </button>
                        <button
                          onClick={() => handleResolveReport(report._id, 'DISMISS', false)}
                          className="px-3 py-1.5 rounded-xl bg-[#140d2e] text-purple-200 hover:text-white border border-purple-900/40 transition-colors cursor-pointer"
                        >
                          Dismiss
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

      {/* PENDING SUBMISSIONS TAB */}
      {activeTab === 'pending' && (
        <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 text-left shadow-xl hud-bracket">
          {pendingResources.length === 0 ? (
            <div className="p-12 text-center text-purple-300/70 text-xs font-mono">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>No pending submissions awaiting review.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-purple-200">
                <thead className="bg-[#07040f] text-purple-300/70 uppercase font-mono border-b border-purple-900/30">
                  <tr>
                    <th className="p-3.5 text-left">Title & URL</th>
                    <th className="p-3.5 text-left">Category</th>
                    <th className="p-3.5 text-left">Submitted By</th>
                    <th className="p-3.5 text-left">Status</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20 font-mono">
                  {pendingResources.map((resItem) => (
                    <tr key={resItem._id} className="hover:bg-[#140d2e]/50 transition-colors">
                      <td className="p-3.5 space-y-0.5 max-w-xs text-left">
                        <p className="font-bold text-white truncate">{resItem.title}</p>
                        <p className="text-[11px] text-purple-400/70 truncate">{resItem.url}</p>
                      </td>
                      <td className="p-3.5 text-left">{resItem.category?.name || 'General'}</td>
                      <td className="p-3.5 text-left text-purple-300/70">
                        {resItem.submittedBy ? `@${resItem.submittedBy.username}` : 'Anonymous'}
                      </td>
                      <td className="p-3.5 text-left">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {resItem.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleUpdateResourceStatus(resItem._id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateResourceStatus(resItem._id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                        >
                          Reject
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

      {/* DYNAMIC PRIVACY & SAFETY POLICY TAB */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 text-left">
          
          <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-8 border border-purple-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hud-bracket shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono font-semibold mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dynamic Policy Editor</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Customize Privacy, Security & Content Rules
              </h3>
              <p className="text-xs font-mono text-purple-300/70">
                Any changes saved here instantly update the public <code className="text-purple-300 font-mono">/privacy</code> page in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/privacy"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 border border-purple-900/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live Page</span>
              </Link>

              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPolicy ? 'Saving...' : 'Save Policy Changes'}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-6">
            
            {/* Header Settings Card */}
            <div className="bg-[#0d081e] rounded-3xl p-6 sm:p-7 border border-purple-900/40 space-y-4 hud-bracket shadow-xl">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>Page Header & Top Summary</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                    Page Main Title
                  </label>
                  <input
                    type="text"
                    required
                    value={policyData.title || ''}
                    onChange={(e) => setPolicyData({ ...policyData, title: e.target.value })}
                    className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
                    placeholder="e.g. Privacy Policy & Safety Guarantees"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                    Badge / Tagline
                  </label>
                  <input
                    type="text"
                    value={policyData.badge || ''}
                    onChange={(e) => setPolicyData({ ...policyData, badge: e.target.value })}
                    className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
                    placeholder="e.g. Security, Privacy & Content Integrity Policy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
                  Subtitle & Last Updated Notice
                </label>
                <textarea
                  rows={2}
                  value={policyData.subtitle || ''}
                  onChange={(e) => setPolicyData({ ...policyData, subtitle: e.target.value })}
                  className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-4 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none resize-none"
                  placeholder="Last updated notice and summary..."
                />
              </div>
            </div>

            {/* Dynamic Sections Card */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Policy Sections ({policyData.sections?.length || 0})</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddPolicySection}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Section</span>
                </button>
              </div>

              {policyData.sections && policyData.sections.map((section, idx) => (
                <div key={idx} className="bg-[#0d081e] rounded-3xl p-5 sm:p-6 border border-purple-900/40 space-y-4 hover:border-purple-600/50 transition-all hud-bracket shadow-md">
                  
                  <div className="flex items-center justify-between gap-2 border-b border-purple-900/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#07040f] text-purple-300 font-mono text-xs flex items-center justify-center font-bold border border-purple-900/40">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-200">Section {idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePolicySection(idx, 'up')}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === policyData.sections.length - 1}
                        onClick={() => handleMovePolicySection(idx, 'down')}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemovePolicySection(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer ml-1"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1">
                        Section Heading *
                      </label>
                      <input
                        type="text"
                        required
                        value={section.title || ''}
                        onChange={(e) => handleUpdatePolicySection(idx, 'title', e.target.value)}
                        className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
                        placeholder="e.g. 1. Anonymous Submissions & Privacy"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1">
                        Display Icon
                      </label>
                      <select
                        value={section.icon || 'ShieldCheck'}
                        onChange={(e) => handleUpdatePolicySection(idx, 'icon', e.target.value)}
                        className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
                      >
                        {ICON_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#0d081e]">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider mb-1">
                      Section Content / Guarantees
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={section.content || ''}
                      onChange={(e) => handleUpdatePolicySection(idx, 'content', e.target.value)}
                      className="w-full bg-[#090515] text-xs font-mono text-purple-100 p-3.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none resize-y"
                      placeholder="Detailed policy text and legal/technical explanations..."
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Bottom Sticky Save Button Bar */}
            <div className="p-4 rounded-3xl bg-[#0d081e]/95 border border-purple-900/40 flex items-center justify-between sticky bottom-4 shadow-2xl backdrop-blur-md hud-bracket">
              <span className="text-xs font-mono text-purple-300/70">
                {policyData.sections?.length || 0} active policy sections ready to publish.
              </span>
              <button
                type="submit"
                disabled={savingPolicy}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPolicy ? 'Saving Changes...' : 'Save & Publish Policy'}</span>
              </button>
            </div>

          </form>

        </div>
      )}

      {/* USER MANAGER & BAN CONTROL TAB (ADMIN ONLY) */}
      {activeTab === 'users' && user.role === 'ADMIN' && (
        <div className="space-y-4 text-left">
          
          {/* User Controls & View Switcher Bar */}
          <div className="bg-[#0d081e] p-4 rounded-3xl border border-purple-900/40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 hud-bracket shadow-xl">
            
            {/* Search Input for Users */}
            <div className="flex items-center gap-2 w-full lg:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search user by @username or email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#090515] border border-purple-900/40 text-purple-100 text-xs focus:border-purple-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Roles' },
                { id: 'USER', label: 'Users' },
                { id: 'MODERATOR', label: 'Moderators' },
                { id: 'ADMIN', label: 'Admins' }
              ].map(roleOpt => (
                <button
                  key={roleOpt.id}
                  onClick={() => setUserRoleFilter(roleOpt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                    userRoleFilter === roleOpt.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-[#140d2e] text-purple-300 hover:text-white border border-purple-900/40'
                  }`}
                >
                  {roleOpt.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher: Table / Grid / List */}
            <div className="flex items-center bg-[#07040f] p-1 rounded-xl border border-purple-900/40 self-end lg:self-center shrink-0">
              <button
                onClick={() => setUserViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  userViewMode === 'table'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Table View (Data Grid)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setUserViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  userViewMode === 'grid'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="Grid View (User Cards)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>

              <button
                onClick={() => setUserViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  userViewMode === 'list'
                    ? 'bg-purple-600 text-white shadow-sm font-semibold'
                    : 'text-purple-300/70 hover:text-white'
                }`}
                title="List View (Horizontal Rows)"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

          </div>

          {/* User List Processing */}
          {(() => {
            const filteredUsers = usersList.filter((u) => {
              const matchesSearch =
                !userSearchTerm.trim() ||
                u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
              const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
              return matchesSearch && matchesRole;
            });

            if (filteredUsers.length === 0) {
              return (
                <div className="bg-[#0d081e] p-12 text-center text-purple-300/70 text-xs font-mono rounded-3xl border border-purple-900/40 hud-bracket">
                  No registered user accounts matching your current search/filter.
                </div>
              );
            }

            if (userViewMode === 'grid') {
              /* GRID VIEW FOR USERS */
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUsers.map((u) => {
                    const isBanned = u.isBanned;
                    return (
                      <div
                        key={u._id}
                        className={`bg-[#0d081e] rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 hud-bracket shadow-xl ${
                          isBanned ? 'border-rose-500/40 bg-rose-950/10' : 'border-purple-900/40 hover:border-purple-500/60'
                        }`}
                      >
                        {/* Top Avatar & Badges */}
                        <div className="space-y-3 text-left">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md">
                              <div className="w-full h-full bg-[#07040f] rounded-[14px] flex items-center justify-center font-bold text-base text-purple-300">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                isBanned
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {isBanned ? 'Banned' : 'Active'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-display font-bold text-base text-white truncate">
                              @{u.username}
                            </h4>
                            <p className="text-xs font-mono text-purple-400/70 truncate">{u.email}</p>
                          </div>

                          <div className="pt-1">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                                  : u.role === 'MODERATOR'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-[#140d2e] text-purple-200 border-purple-900/40'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                        </div>

                        {/* Controls Bottom */}
                        <div className="pt-3 border-t border-purple-900/30 space-y-2">
                          {/* Role Toggle Selector */}
                          <div className="flex items-center gap-1 bg-[#07040f] p-1 rounded-xl border border-purple-900/40 justify-between">
                            {['USER', 'MODERATOR', 'ADMIN'].map((roleOption) => (
                              <button
                                key={roleOption}
                                disabled={u.role === roleOption}
                                onClick={() => handleRoleChange(u._id, roleOption)}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                                  u.role === roleOption
                                    ? 'bg-purple-600 text-white font-bold shadow'
                                    : 'text-purple-400/70 hover:text-white'
                                }`}
                              >
                                {roleOption}
                              </button>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleToggleBanUser(u._id, u.username, isBanned)}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                                isBanned
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                              }`}
                              title={isBanned ? 'Unban User Account' : 'Ban User Account'}
                            >
                              {isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                              <span>{isBanned ? 'Unban' : 'Ban User'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u._id, u.username)}
                              disabled={u.role === 'ADMIN'}
                              className={`p-1.5 rounded-xl border transition-colors flex items-center justify-center cursor-pointer ${
                                u.role === 'ADMIN'
                                  ? 'opacity-30 cursor-not-allowed bg-[#140d2e] text-purple-400/50 border-purple-900/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              }`}
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            if (userViewMode === 'list') {
              /* LIST VIEW FOR USERS */
              return (
                <div className="space-y-3">
                  {filteredUsers.map((u) => {
                    const isBanned = u.isBanned;
                    return (
                      <div
                        key={u._id}
                        className={`bg-[#0d081e] rounded-3xl p-4 border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hud-bracket shadow-xl ${
                          isBanned ? 'border-rose-500/40 bg-rose-950/10' : 'border-purple-900/40 hover:border-purple-500/40'
                        }`}
                      >
                        {/* Left Details */}
                        <div className="flex items-center gap-3 min-w-0 text-left">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shrink-0">
                            <div className="w-full h-full bg-[#07040f] rounded-[10px] flex items-center justify-center font-bold text-sm text-purple-300 font-display">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-sm text-white truncate">
                                @{u.username}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  u.role === 'ADMIN'
                                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                                    : u.role === 'MODERATOR'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-[#140d2e] text-purple-200 border-purple-900/40'
                                }`}
                              >
                                {u.role}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  isBanned
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                              >
                                {isBanned ? 'Banned' : 'Active'}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-purple-400/70 truncate mt-0.5">{u.email}</p>
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Role Switcher */}
                          <div className="flex items-center bg-[#07040f] p-1 rounded-xl border border-purple-900/40">
                            {['USER', 'MODERATOR', 'ADMIN'].map((roleOption) => (
                              <button
                                key={roleOption}
                                disabled={u.role === roleOption}
                                onClick={() => handleRoleChange(u._id, roleOption)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                                  u.role === roleOption
                                    ? 'bg-purple-600 text-white font-bold shadow'
                                    : 'text-purple-400/70 hover:text-white'
                                }`}
                              >
                                {roleOption}
                              </button>
                            ))}
                          </div>

                          {/* Ban Button */}
                          <button
                            onClick={() => handleToggleBanUser(u._id, u.username, isBanned)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                              isBanned
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            }`}
                          >
                            {isBanned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            <span>{isBanned ? 'Unban' : 'Ban'}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            disabled={u.role === 'ADMIN'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                              u.role === 'ADMIN'
                                ? 'opacity-30 cursor-not-allowed bg-[#140d2e] text-purple-400/50 border-purple-900/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }

            /* TABLE VIEW FOR USERS */
            return (
              <div className="bg-[#0d081e] rounded-3xl overflow-hidden border border-purple-900/40 text-left shadow-xl hud-bracket">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-purple-200">
                    <thead className="bg-[#07040f] text-purple-300/70 uppercase font-mono border-b border-purple-900/30">
                      <tr>
                        <th className="p-3.5 text-left">User</th>
                        <th className="p-3.5 text-left">Email</th>
                        <th className="p-3.5 text-left">Role</th>
                        <th className="p-3.5 text-left">Account Status</th>
                        <th className="p-3.5 text-right">Role Assignment & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/20 font-mono">
                      {filteredUsers.map((u) => {
                        const isBanned = u.isBanned;
                        return (
                          <tr key={u._id} className="hover:bg-[#140d2e]/50 transition-colors">
                            <td className="p-3.5 font-semibold text-white text-left">@{u.username}</td>
                            <td className="p-3.5 text-left text-purple-400/70">{u.email}</td>

                            {/* Role Badge */}
                            <td className="p-3.5 text-left">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                  u.role === 'ADMIN'
                                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                                    : u.role === 'MODERATOR'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-[#140d2e] text-purple-200 border border-purple-900/40'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Account Status Badge */}
                            <td className="p-3.5 text-left">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                  isBanned
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {isBanned ? 'SUSPENDED / BANNED' : 'ACTIVE'}
                              </span>
                            </td>

                            {/* Admin Actions */}
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              {/* Role Change Buttons */}
                              {['USER', 'MODERATOR', 'ADMIN'].map((roleOption) => (
                                <button
                                  key={roleOption}
                                  disabled={u.role === roleOption}
                                  onClick={() => handleRoleChange(u._id, roleOption)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                    u.role === roleOption
                                      ? 'opacity-40 cursor-not-allowed bg-[#140d2e] text-purple-400/50'
                                      : 'bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 border border-purple-900/40'
                                  }`}
                                >
                                  {roleOption}
                                </button>
                              ))}

                              {/* Ban / Unban Toggle Button */}
                              <button
                                onClick={() => handleToggleBanUser(u._id, u.username, isBanned)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors inline-flex items-center gap-1 cursor-pointer ${
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
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                                  u.role === 'ADMIN'
                                    ? 'opacity-30 cursor-not-allowed bg-[#140d2e] text-purple-400/50 border-purple-900/30'
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
            );
          })()}

        </div>
      )}

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={!!editingResource}
        onClose={() => setEditingResource(null)}
        resource={editingResource}
        onResourceUpdated={() => fetchAdminData()}
      />

      {/* Edit Collection / Vault Modal */}
      <EditCollectionModal
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        collection={editingCollection}
        onCollectionUpdated={() => fetchAdminData()}
      />

    </div>
  );
};
