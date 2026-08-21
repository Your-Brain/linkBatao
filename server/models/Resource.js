import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true
    },
    normalizedUrl: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    thumbnail: {
      type: String,
      default: ''
    },
    domain: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      enum: ['VIDEO', 'IMAGE', 'ARTICLE', 'WEBSITE', 'AUDIO', 'OTHER'],
      default: 'WEBSITE',
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    embedType: {
      type: String,
      enum: ['YOUTUBE', 'VIMEO', 'SOUNDCLOUD', 'SPOTIFY', 'DIRECT_VIDEO', 'DIRECT_IMAGE', 'NONE'],
      default: 'NONE'
    },
    isNsfw: {
      type: Boolean,
      default: false,
      index: true
    },
    embedUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REMOVED'],
      default: 'APPROVED',
      index: true
    },
    linkHealth: {
      type: String,
      enum: ['ACTIVE', 'BROKEN', 'UNKNOWN'],
      default: 'ACTIVE'
    },
    anonymousId: {
      type: String,
      default: function() {
        const randomHex = Math.floor(Math.random() * 0xfffff).toString(16).toUpperCase().padStart(5, '0');
        return `Anonymous #${randomHex}`;
      }
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    views: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    reportsCount: {
      type: Number,
      default: 0
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search
resourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  domain: 'text'
});

// Pre-save hook to recalculate trending score
resourceSchema.pre('save', function (next) {
  const ageInHours = (Date.now() - new Date(this.createdAt || Date.now()).getTime()) / (1000 * 60 * 60);
  const score = (this.views * 1 + this.saves * 3 - this.reportsCount * 5) / Math.pow(ageInHours + 2, 1.5);
  this.trendingScore = Math.max(0, score);
  next();
});

export default mongoose.model('Resource', resourceSchema);
