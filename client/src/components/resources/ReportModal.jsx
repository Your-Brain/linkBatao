import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#03050a]/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md glass-modal rounded-3xl p-6 shadow-2xl border border-rose-500/30 text-left hud-bracket"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#090e1d] border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Signal Report Console</h3>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-[240px]">{resource.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Anomaly / Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#090e1d] text-xs font-mono text-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-rose-400 outline-none cursor-pointer"
            >
              <option value="BROKEN_LINK">Broken or offline target URL</option>
              <option value="SPAM">Spam or misleading destination</option>
              <option value="MALICIOUS">Malware, exploit, or security threat</option>
              <option value="COPYRIGHT">Copyright or DMCA notice</option>
              <option value="INCORRECT_CATEGORY">Incorrect channel / invalid tags</option>
              <option value="HARASSMENT">Harassment or abusive content</option>
              <option value="OTHER">Other network concern</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Telemetry Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue for the moderation command team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#090e1d] text-xs text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:border-rose-400 outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{submitting ? 'Transmitting...' : 'Dispatch Report'}</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>,
    document.body
  );
};
