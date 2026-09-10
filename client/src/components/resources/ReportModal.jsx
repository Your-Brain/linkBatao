import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Flag, Send } from 'lucide-react';

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
        showToast('Telemetry report submitted for moderation review. Thank you!', 'success');
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#07040f]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-md bg-[#0d081e] rounded-3xl p-6 sm:p-7 shadow-2xl border border-purple-900/40 text-left hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-purple-300 hover:text-white rounded-xl bg-[#140d2e] border border-purple-900/40 hover:border-purple-500/50 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white">Report Resource Issue</h3>
            <p className="text-xs font-mono text-purple-300/70 truncate max-w-[240px]">{resource.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none cursor-pointer"
            >
              <option value="BROKEN_LINK" className="bg-[#0d081e]">Broken or offline target URL</option>
              <option value="SPAM" className="bg-[#0d081e]">Spam or misleading content</option>
              <option value="MALICIOUS" className="bg-[#0d081e]">Malware or security risk</option>
              <option value="COPYRIGHT" className="bg-[#0d081e]">Copyright or DMCA issue</option>
              <option value="INCORRECT_CATEGORY" className="bg-[#0d081e]">Incorrect category or tags</option>
              <option value="HARASSMENT" className="bg-[#0d081e]">Inappropriate or abusive content</option>
              <option value="OTHER" className="bg-[#0d081e]">Other issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-purple-200 mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue for moderation review..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090515] text-xs font-mono text-purple-100 placeholder-purple-400/40 px-3.5 py-2.5 rounded-xl border border-purple-900/40 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 outline-none resize-none transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-purple-900/30">
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>,
    document.body
  );
};
