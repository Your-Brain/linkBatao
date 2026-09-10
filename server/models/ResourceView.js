import mongoose from 'mongoose';

const resourceViewSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true
    },
    viewerIdentifier: {
      type: String,
      required: true,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // 24 hours TTL: auto-deletes record after 24h
    }
  },
  {
    timestamps: false
  }
);

// Compound unique index to guarantee 1 unique view per viewer per resource in 24 hours
resourceViewSchema.index({ resource: 1, viewerIdentifier: 1 }, { unique: true });

export default mongoose.model('ResourceView', resourceViewSchema);
