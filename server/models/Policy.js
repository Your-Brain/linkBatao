import mongoose from 'mongoose';

const policySectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'ShieldCheck'
  },
  content: {
    type: String,
    required: true
  }
}, { _id: true });

const policySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'privacy-safety'
  },
  title: {
    type: String,
    default: 'Privacy Policy & Safety Guarantees'
  },
  badge: {
    type: String,
    default: 'Security, Privacy & Content Integrity Policy'
  },
  subtitle: {
    type: String,
    default: 'Last updated: August 2026. Learn how AuraLink protects your privacy and handles untrusted external links safely.'
  },
  sections: [policySectionSchema],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Policy = mongoose.model('Policy', policySchema);
export default Policy;
