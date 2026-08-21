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
    return <IconComp className="w-5 h-5 text-indigo-400 shrink-0" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-left">
      
      {/* Header Banner */}
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 space-y-3 relative overflow-hidden shadow-sm">
        
        {/* Admin Quick Edit Button */}
        {isAdminOrMod && (
          <div className="absolute top-6 right-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
              title="Edit policy in Admin Panel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/15 text-indigo-300 text-xs font-medium border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{policy.badge || 'Security & Privacy Policy'}</span>
        </div>
        
        <h1 className="font-bold text-2xl sm:text-4xl text-white">
          {policy.title || 'Privacy Policy & Safety Standards'}
        </h1>
        
        <p className="text-xs sm:text-sm text-zinc-400">
          {policy.subtitle}
        </p>
      </div>

      {/* Article Sections */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 flex items-center justify-center gap-2 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading policy data...</span>
        </div>
      ) : (
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          {policy.sections && policy.sections.map((section, idx) => (
            <motion.section 
              key={section._id || idx} 
              id={`section-${idx + 1}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-zinc-900/80 rounded-2xl p-6 border border-zinc-800 space-y-2.5 hover:border-zinc-700 transition-colors shadow-sm"
            >
              <h2 className="font-semibold text-base sm:text-lg text-white flex items-center gap-2.5">
                {renderIcon(section.icon)}
                <span>{section.title}</span>
              </h2>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>
      )}

    </div>
  );
};
