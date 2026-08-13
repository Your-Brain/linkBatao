import React from 'react';
import { ShieldCheck, Lock, ExternalLink, FileText, AlertOctagon } from 'lucide-react';

export const PrivacyTermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-left">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-sky-500/20 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security, Privacy & Content Integrity Policy</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Privacy Policy & Safety Guarantees
        </h1>
        <p className="text-sm text-slate-300">
          Last updated: August 2026. Learn how AuraLink protects your privacy and handles untrusted external links safely.
        </p>
      </div>

      {/* Article Sections */}
      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        
        {/* Section 1 */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-sky-400" />
            <span>1. Anonymous Submissions & Privacy</span>
          </h2>
          <p>
            AuraLink allows users to submit and discover online links without requiring account registration. When submitting anonymously, our platform automatically assigns a public identifier (e.g. <code>Anonymous #A8F42</code>). We do NOT publicly expose submitter IP addresses, geographic locations, browser fingerprints, or email addresses.
          </p>
        </section>

        {/* Section 2 */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-cyan-400" />
            <span>2. Link Indexing & Embedded Media Principles</span>
          </h2>
          <p>
            AuraLink functions exclusively as a <strong>link discovery, indexing, search, and bookmarking service</strong>. The application does NOT download, mirror, copy, or redistribute copyrighted third-party media files on our servers.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Where third-party platforms explicitly permit iframe embedding (e.g. YouTube, Vimeo, Spotify, SoundCloud), media plays directly inside our player abstraction.</li>
            <li>For platforms disallowing iframe embedding or requiring authentication, an explicit <strong>"Open Original Source"</strong> button directs users to the source website.</li>
            <li>AuraLink does not bypass DRM, paywalls, platform access controls, or disabled embedding settings.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3" id="dmca">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>3. Copyright & DMCA Link Removal</span>
          </h2>
          <p>
            We respect the intellectual property rights of content creators. If you are a copyright holder and believe a link submitted to AuraLink points to infringing content, click the <strong>"Report Link"</strong> button on the resource page or contact our moderation team at <code>dmca@auralink.io</code>. Valid requests will result in prompt link removal.
          </p>
        </section>

        {/* Section 4 */}
        <section className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3" id="terms">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>4. SSRF & Security Protection</span>
          </h2>
          <p>
            Submitted URLs are validated against Server-Side Request Forgery (SSRF) filters. Requests targeting local network addresses (e.g. <code>localhost</code>, <code>127.0.0.1</code>, <code>10.x.x.x</code>, <code>192.168.x.x</code>) or internal cloud metadata endpoints are strictly blocked by our crawler.
          </p>
        </section>

      </div>

    </div>
  );
};
