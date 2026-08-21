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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-800 text-left space-y-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Save Link to Collection</h3>
            <p className="text-xs text-zinc-400 truncate max-w-[260px]">{resource.title}</p>
          </div>
        </div>

        {/* List of user's collections */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {loading ? (
            <div className="py-8 text-center text-zinc-400 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Loading your collections...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="py-6 text-center text-zinc-400 text-xs space-y-1">
              <p className="font-medium">No collections created yet.</p>
              <p className="text-xs text-zinc-500">Create your first collection below.</p>
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    inCol
                      ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${
                        inCol ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {col.visibility === 'PRIVATE' ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{col.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {col.items ? col.items.length : 0} items • {col.visibility}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          inCol ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-900'
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
        <div className="pt-3 border-t border-zinc-800">
          {showInlineCreate ? (
            <form onSubmit={handleInlineCreate} className="space-y-3">
              <input
                type="text"
                autoFocus
                placeholder="Collection name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full bg-zinc-950 text-xs text-zinc-100 placeholder-zinc-500 px-3.5 py-2 rounded-xl border border-zinc-800 focus:border-indigo-500 outline-none"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewColVis('PUBLIC')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                      newColVis === 'PUBLIC'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewColVis('PRIVATE')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                      newColVis === 'PRIVATE'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Private
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInlineCreate(false)}
                    className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-3.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm cursor-pointer"
                  >
                    {creating ? 'Creating...' : 'Create & Save'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowInlineCreate(true)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-indigo-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Collection</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};

