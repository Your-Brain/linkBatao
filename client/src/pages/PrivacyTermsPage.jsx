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
  Radio
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
  title: 'Privacy Policy & Safety Guarantees',
  badge: 'Security, Privacy & Content Integrity Policy',
  subtitle: 'Last updated: August 2026. Learn how AuraLink protects your privacy and handles untrusted external links safely.',
  sections: [
    {
      title: '1. Anonymous Submissions & Privacy',
      icon: 'Lock',
      content: 'AuraLink allows users to submit and discover online links without requiring account registration. When submitting anonymously, our platform automatically assigns a public identifier (e.g. Anonymous #A8F42). We do NOT publicly expose submitter IP addresses, geographic locations, browser fingerprints, or email addresses.'
    },
    {
      title: '2. Link Indexing & Embedded Media Principles',
      icon: 'ExternalLink',
      content: 'AuraLink functions exclusively as a link discovery, indexing, search, and bookmarking service. The application does NOT download, mirror, copy, or redistribute copyrighted third-party media files on our servers. Where third-party platforms explicitly permit iframe embedding (e.g. YouTube, Vimeo, Spotify, SoundCloud), media plays directly inside our player abstraction. AuraLink does not bypass DRM, paywalls, platform access controls, or disabled embedding settings.'
    },
    {
      title: '3. Copyright & DMCA Link Removal',
      icon: 'AlertOctagon',
      content: 'We respect the intellectual property rights of content creators. If you are a copyright holder and believe a link submitted to AuraLink points to infringing content, click the "Report Link" button on the resource page or contact our moderation team. Valid requests will result in prompt link removal.'
    },
    {
      title: '4. SSRF & Security Protection',
      icon: 'FileText',
      content: 'Submitted URLs are validated against Server-Side Request Forgery (SSRF) filters. Requests targeting local network addresses (e.g. localhost, 127.0.0.1, 10.x.x.x, 192.168.x.x) or internal cloud metadata endpoints are strictly blocked by our crawler.'
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
    return <IconComp className="w-5 h-5 text-cyan-400 shrink-0" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-left">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-cyan-500/25 space-y-3 relative overflow-hidden hud-bracket">
        
        {/* Admin Quick Edit Button */}
        {isAdminOrMod && (
          <div className="absolute top-6 right-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono font-semibold shadow-sm transition-all"
              title="Edit this policy in Admin Panel"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit in Admin</span>
            </Link>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/20">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{policy.badge || 'Security, Privacy & Content Integrity Policy'}</span>
        </div>
        
        <h1 className="font-display font-bold text-2xl sm:text-4xl text-white">
          {policy.title || 'Privacy Policy & Safety Guarantees'}
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-300">
          {policy.subtitle}
        </p>
      </div>

      {/* Article Sections */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-mono">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Querying policy protocol data...</span>
        </div>
      ) : (
        <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
          {policy.sections && policy.sections.map((section, idx) => (
            <motion.section 
              key={section._id || idx} 
              id={`section-${idx + 1}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 hover:border-cyan-500/30 transition-colors hud-bracket"
            >
              <h2 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2.5">
                {renderIcon(section.icon)}
                <span>{section.title}</span>
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>
      )}

    </div>
  );
};
