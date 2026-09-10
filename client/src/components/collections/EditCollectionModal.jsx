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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-[#0d081e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-900/40 text-left hud-bracket">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
            <FolderEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">Edit Vault Collection</h3>
            <p className="text-xs font-mono text-purple-300/70">Update collection details and visibility</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Collection Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Machine Learning Toolkits"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the purpose of this collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Privacy Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer ${
                  visibility === 'PUBLIC'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-bold shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : 'bg-[#090515] border-purple-900/40 text-purple-400/70 hover:text-purple-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer ${
                  visibility === 'PRIVATE'
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 font-bold shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : 'bg-[#090515] border-purple-900/40 text-purple-400/70 hover:text-purple-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Private</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-purple-300/70 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
