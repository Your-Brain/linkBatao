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
        showToast('Vault created successfully!', 'success');
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0d081e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-900/40 text-left hud-bracket">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Create New Vault</h3>
            <p className="text-xs font-mono text-purple-300/70">Organize saved links into custom lists</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Vault Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. React 19 Tutorials, AI Shaders, Research..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Summary and focus of this vault collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 outline-none resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 uppercase tracking-wider mb-1.5">
              Privacy Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  visibility === 'PUBLIC'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : 'bg-[#090515] border-purple-900/40 text-purple-400/70 hover:text-purple-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Public List</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                  visibility === 'PRIVATE'
                    ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : 'bg-[#090515] border-purple-900/40 text-purple-400/70 hover:text-purple-200'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Private Only</span>
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-purple-900/30">
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(147,51,234,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Vault'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
