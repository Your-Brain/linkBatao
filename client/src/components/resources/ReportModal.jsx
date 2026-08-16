import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Flag, AlertCircle, Send } from 'lucide-react';

export const ReportModal = ({ resource, isOpen, onClose }) => {
  const { showToast } = useToast();
  const [reason, setReason] = useState('BROKEN_LINK');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post(`/resources/${resource._id}/report`, {
        reason,
        description
      });
      if (res.data.success) {
        showToast('Report submitted for moderation review. Thank you!', 'success');
        onClose();
        setDescription('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit report', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-rose-500/30 text-left">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-dark-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Report Resource</h3>
            <p className="text-xs text-slate-400 truncate max-w-[240px]">{resource.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-rose-400 outline-none"
            >
              <option value="BROKEN_LINK">Broken or unavailable link</option>
              <option value="SPAM">Spam or misleading redirect</option>
              <option value="MALICIOUS">Malware or phishing concern</option>
              <option value="COPYRIGHT">Copyright or infringement concerns</option>
              <option value="INCORRECT_CATEGORY">Wrong category or tags</option>
              <option value="HARASSMENT">Harassment or illegal content</option>
              <option value="OTHER">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue in detail for our moderation team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark-900 text-sm text-slate-100 placeholder-slate-500 px-4 py-2.5 rounded-xl border border-slate-700 focus:border-rose-400 outline-none resize-none"
            />
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
              className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
