import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, FolderPlus, Check, Plus, Lock, Globe, Loader2, Layers } from 'lucide-react';

export const AddToCollectionModal = ({ isOpen, onClose, resource }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Quick inline creation state
  const [showInlineCreate, setShowInlineCreate] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColVis, setNewColVis] = useState('PUBLIC');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchMyCollections();
    }
  }, [isOpen, user]);

  const fetchMyCollections = async () => {
    setLoading(true);
    try {
      const res = await API.get('/collections');
      if (res.data.success) {
        // Filter to collections owned by the logged-in user
        const myCols = res.data.data.filter(
          (col) => col.ownerId && (col.ownerId._id === user._id || col.ownerId === user._id)
        );
        setCollections(myCols);
      }
    } catch (err) {
      console.error('[AddToCollectionModal] Failed to fetch user collections:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !resource) return null;

  const isItemInCollection = (col) => {
    if (!col.items || !Array.isArray(col.items)) return false;
    return col.items.some((item) => {
      const itemId = typeof item === 'object' ? item._id : item;
      return itemId === resource._id;
    });
  };

  const handleToggleCollection = async (col) => {
    if (togglingId) return;
    const inCol = isItemInCollection(col);
    setTogglingId(col._id);

    try {
      if (inCol) {
        const res = await API.delete(`/collections/${col._id}/items/${resource._id}`);
        if (res.data.success) {
          showToast(`Removed from "${col.name}"`, 'info');
          setCollections((prev) =>
            prev.map((c) =>
              c._id === col._id
                ? { ...c, items: c.items.filter((i) => (typeof i === 'object' ? i._id : i) !== resource._id) }
                : c
            )
          );
        }
      } else {
        const res = await API.post(`/collections/${col._id}/items`, { resourceId: resource._id });
        if (res.data.success) {
          showToast(`Saved into "${col.name}"!`, 'success');
          setCollections((prev) =>
            prev.map((c) =>
              c._id === col._id ? { ...c, items: [...c.items, resource] } : c
            )
          );
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update vault', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleInlineCreate = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) {
      showToast('Please enter a collection name', 'info');
      return;
    }
    setCreating(true);
    try {
      const res = await API.post('/collections', {
        name: newColName.trim(),
        visibility: newColVis,
        items: [resource._id]
      });
      if (res.data.success) {
        showToast(`Created vault "${res.data.data.name}"!`, 'success');
        setNewColName('');
        setShowInlineCreate(false);
        fetchMyCollections();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create collection', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md bg-[#0d081e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-900/40 text-left space-y-4 hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">Save Link to Collection</h3>
            <p className="text-xs font-mono text-purple-300/70 truncate max-w-[260px]">{resource.title}</p>
          </div>
        </div>

        {/* List of user's collections */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-8 text-center text-purple-300 flex items-center justify-center gap-2 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Loading your collections...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-6 text-center text-purple-300/70 text-xs font-mono space-y-1">
              <p className="font-medium text-purple-200">No collections created yet.</p>
              <p className="text-[11px] text-purple-400/60">Create your first collection below.</p>
            </div>
          ) : (
            collections.map((col) => {
              const inCol = isItemInCollection(col);
              const isToggling = togglingId === col._id;

              return (
                <button
                  key={col._id}
                  onClick={() => handleToggleCollection(col)}
                  disabled={isToggling}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    inCol
                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                      : 'bg-[#090515] border-purple-900/30 text-purple-200 hover:border-purple-700/50 hover:bg-[#140d2e]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl border ${
                        inCol ? 'bg-purple-600/30 border-purple-500/50 text-purple-300' : 'bg-[#140d2e] border-purple-900/40 text-purple-400'
                      }`}
                    >
                      {col.visibility === 'PRIVATE' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate font-display">{col.name}</p>
                      <p className="text-[11px] text-purple-400/70 font-mono">
                        {col.items ? col.items.length : 0} items • {col.visibility}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          inCol ? 'bg-purple-600 border-purple-500 text-white shadow-sm' : 'border-purple-900/50 bg-[#140d2e]'
                        }`}
                      >
                        {inCol && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Quick inline create collection */}
        <div className="pt-2 border-t border-purple-900/30">
          {!showInlineCreate ? (
            <button
              type="button"
              onClick={() => setShowInlineCreate(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-purple-900/50 hover:border-purple-500 text-purple-300 hover:text-white bg-[#140d2e]/50 hover:bg-[#140d2e] text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Vault & Save</span>
            </button>
          ) : (
            <form onSubmit={handleInlineCreate} className="space-y-2.5">
              <input
                type="text"
                required
                placeholder="Collection name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={newColVis}
                  onChange={(e) => setNewColVis(e.target.value)}
                  className="bg-[#090515] text-xs font-mono text-purple-200 px-3 py-1.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none cursor-pointer"
                >
                  <option value="PUBLIC" className="bg-[#0d081e]">Public</option>
                  <option value="PRIVATE" className="bg-[#0d081e]">Private</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowInlineCreate(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono text-purple-400/70 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </motion.div>
    </div>
  );
};
