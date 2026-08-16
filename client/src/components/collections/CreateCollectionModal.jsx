import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, FolderPlus, Lock, Globe } from 'lucide-react';

export const CreateCollectionModal = ({ isOpen, onClose, onCollectionCreated }) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a collection name', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/collections', {
        name: name.trim(),
        description: description.trim(),
        visibility
      });
      if (res.data.success) {
        showToast('Collection created successfully!', 'success');
        if (onCollectionCreated) onCollectionCreated(res.data.data);
        onClose();
        setName('');
        setDescription('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create collection', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-cyan-500/30 text-left">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Create Collection</h3>
            <p className="text-xs text-slate-400">Organize saved links into custom lists</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Collection Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React 19 Tutorials, Fashion Lookbooks..."
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
              rows={2}
              placeholder="Optional summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${visibility === 'PUBLIC'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-dark-900 border-slate-700 text-slate-400'
                  }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public List</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${visibility === 'PRIVATE'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-dark-900 border-slate-700 text-slate-400'
                  }`}
              >
                <Lock className="w-4 h-4" />
                <span>Private Only</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs shadow-glow hover:scale-105 transition-all cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
