import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, FolderEdit, Lock, Globe, Save } from 'lucide-react';

export const EditCollectionModal = ({ isOpen, onClose, collection, onCollectionUpdated }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
      setVisibility(collection.visibility || 'PUBLIC');
    }
  }, [collection]);

  if (!isOpen || !collection) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a collection name', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.put(`/collections/${collection._id}`, {
        name: name.trim(),
        description: description.trim(),
        visibility
      });
      if (res.data.success) {
        showToast('Vault updated successfully!', 'success');
        if (onCollectionUpdated) onCollectionUpdated(res.data.data);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update collection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-cyan-500/30 text-left hud-bracket">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <FolderEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Modify Data Vault</h3>
            <p className="text-xs text-slate-400">Update parameters and privacy permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Vault Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Machine Learning Toolkits"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the purpose of this vault..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Visibility Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  visibility === 'PUBLIC'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-dark-900 border-slate-700 text-slate-400'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public Vault</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  visibility === 'PRIVATE'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-dark-900 border-slate-700 text-slate-400'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Private Only</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs shadow-glow hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Vault'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
