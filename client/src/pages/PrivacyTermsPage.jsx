import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  FileText, 
  AlertOctagon, 
  AlertTriangle, 
  Shield, 
  CheckCircle2, 
  Globe, 
  Edit3, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  Lock: Lock,
  ShieldCheck: ShieldCheck,
  Shield: Shield,
  ExternalLink: ExternalLink,
  FileText: FileText,
  AlertOctagon: AlertOctagon,
  AlertTriangle: AlertTriangle,
  CheckCircle2: CheckCircle2,
  Globe: Globe
};

const DEFAULT_POLICY = {
  title: 'Privacy Policy & Safety Standards',
  badge: 'Security, Privacy & Content Safety',
  subtitle: 'Last updated: August 2026. Learn how AuraLink protects your privacy and indexes links safely.',
  sections: [
    {
      title: '1. Anonymous Submissions & Zero Tracking',
      icon: 'Lock',
      content: 'AuraLink allows users to submit and discover online links without requiring personal information. When submitting anonymously, our platform automatically assigns a public identifier. We do not track or sell user IP addresses, location data, or browser fingerprints.'
    },
    {
      title: '2. Link Indexing & Embedded Media Principles',
      icon: 'ExternalLink',
      content: 'AuraLink functions exclusively as a link discovery and bookmarking service. The platform does not host, download, mirror, or redistribute copyrighted third-party media files on our servers. Where third-party services provide embeddable players (e.g. YouTube, Vimeo, Spotify), media plays natively in sandboxed frames.'
    },
    {
      title: '3. Copyright & DMCA Notice',
      icon: 'AlertOctagon',
      content: 'We respect the intellectual property rights of content creators. If you are a copyright holder and believe a link submitted to AuraLink points to infringing content, please report the link or contact our team for immediate removal.'
    },
    {
      title: '4. SSRF & Crawler Protection',
      icon: 'FileText',
      content: 'All submitted URLs are validated against Server-Side Request Forgery (SSRF) filters. Requests targeting local network addresses (e.g. localhost, 127.0.0.1, 10.x.x.x, 192.168.x.x) or internal cloud metadata endpoints are strictly rejected.'
    }
  ]
};

export const PrivacyTermsPage = () => {
  const { user } = useAuth();
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await API.get('/policies/privacy-safety');
        if (res.data.success && res.data.data) {
          setPolicy(res.data.data);
        }
      } catch (err) {
        console.warn('Using default policy fallback:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  const renderIcon = (iconName) => {
    const IconComp = ICON_MAP[iconName] || ShieldCheck;
    return <IconComp className="w-5 h-5 text-purple-400 shrink-0" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="bg-[#0d081e] rounded-3xl p-8 border border-purple-900/40 space-y-3 relative overflow-hidden shadow-xl hud-bracket">
        
        {/* Admin Quick Edit Button */}
        {isAdminOrMod && (
          <div className="absolute top-6 right-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#140d2e] hover:bg-[#1a1138] text-purple-200 border border-purple-900/40 text-xs font-mono font-medium transition-all hover:border-purple-500"
              title="Edit policy in Admin Panel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/15 text-purple-300 text-xs font-mono border border-purple-500/30">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{policy.badge || 'Security & Privacy Policy'}</span>
        </div>
        
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
          {policy.title || 'Privacy Policy & Safety Standards'}
        </h1>
        
        <p className="text-xs sm:text-sm text-purple-200/70 font-mono">
          {policy.subtitle}
        </p>
      </div>

      {/* Article Sections */}
      {loading ? (
        <div className="p-12 text-center text-purple-300 flex items-center justify-center gap-2 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Loading policy data...</span>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-purple-200 leading-relaxed">
          {policy.sections && policy.sections.map((section, idx) => (
            <motion.section 
              key={section._id || idx} 
              id={`section-${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-[#0d081e] rounded-3xl p-6 sm:p-7 border border-purple-900/40 space-y-2.5 hover:border-purple-600/50 transition-all shadow-md hud-bracket"
            >
              <h2 className="font-display font-semibold text-base sm:text-lg text-white flex items-center gap-2.5">
                {renderIcon(section.icon)}
                <span>{section.title}</span>
              </h2>
              <div className="text-purple-300/80 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>
      )}

    </div>
  );
};
