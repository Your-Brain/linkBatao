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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03050a]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-cyan-500/30 text-left space-y-4 hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#090e1d] border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Save Signal to Vault</h3>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-[260px]">{resource.title}</p>
          </div>
        </div>

        {/* List of user's collections */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Querying your data vaults...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs space-y-1">
              <p className="font-mono">No vaults established yet.</p>
              <p className="text-[11px] text-slate-500">Initialize your first vault channel below.</p>
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
                      ? 'bg-cyan-500/15 border-cyan-400/50 text-white'
                      : 'bg-[#090e1d] border-slate-800 text-slate-300 hover:border-cyan-500/30 hover:bg-[#0e162c]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl border ${
                        inCol ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' : 'bg-dark-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {col.visibility === 'PRIVATE' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{col.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {col.items ? col.items.length : 0} items • {col.visibility}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                          inCol ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-dark-800'
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

        {/* Inline Create Collection toggle */}
        <div className="pt-3 border-t border-slate-800">
          {showInlineCreate ? (
            <form onSubmit={handleInlineCreate} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="Vault name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2 rounded-xl border border-slate-800 focus:border-cyan-400 outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewColVis('PUBLIC')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border cursor-pointer ${
                      newColVis === 'PUBLIC'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#090e1d] border-slate-800 text-slate-400'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewColVis('PRIVATE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border cursor-pointer ${
                      newColVis === 'PRIVATE'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-[#090e1d] border-slate-800 text-slate-400'
                    }`}
                  >
                    Private
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInlineCreate(false)}
                    className="px-3 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-3.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold font-mono text-[11px] shadow-glow cursor-pointer"
                  >
                    {creating ? 'Creating...' : 'Create & Vault'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowInlineCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#090e1d] hover:bg-[#0e162c] border border-slate-800 text-xs font-mono font-semibold text-cyan-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize New Vault</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};
