import Policy from '../models/Policy.js';

const DEFAULT_PRIVACY_SECTIONS = [
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
];

// @desc    Get policy by key (Public)
// @route   GET /api/policies/:key
// @access  Public
export const getPolicy = async (req, res, next) => {
  try {
    const key = req.params.key || 'privacy-safety';
    let policy = await Policy.findOne({ key });

    if (!policy) {
      // Return default template if not yet initialized in database
      policy = {
        key: 'privacy-safety',
        title: 'Privacy Policy & Safety Guarantees',
        badge: 'Security, Privacy & Content Integrity Policy',
        subtitle: `Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Learn how AuraLink protects your privacy and handles untrusted external links safely.`,
        sections: DEFAULT_PRIVACY_SECTIONS
      };
    }

    res.json({
      success: true,
      data: policy
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update policy by key (Admin/Moderator)
// @route   PUT /api/admin/policies/:key
// @access  Private (Admin/Moderator)
export const updatePolicy = async (req, res, next) => {
  try {
    const key = req.params.key || 'privacy-safety';
    const { title, badge, subtitle, sections } = req.body;

    let policy = await Policy.findOne({ key });

    if (!policy) {
      policy = new Policy({
        key,
        title,
        badge,
        subtitle,
        sections: sections || DEFAULT_PRIVACY_SECTIONS,
        updatedBy: req.user?._id
      });
    } else {
      if (title !== undefined) policy.title = title;
      if (badge !== undefined) policy.badge = badge;
      if (subtitle !== undefined) policy.subtitle = subtitle;
      if (sections !== undefined) policy.sections = sections;
      policy.updatedBy = req.user?._id;
    }

    await policy.save();

    res.json({
      success: true,
      message: 'Policy updated successfully',
      data: policy
    });
  } catch (err) {
    next(err);
  }
};
