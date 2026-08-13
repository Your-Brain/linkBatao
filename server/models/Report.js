import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reason: {
      type: String,
      enum: [
        'BROKEN_LINK',
        'SPAM',
        'MALICIOUS',
        'MISLEADING',
        'COPYRIGHT',
        'HARASSMENT',
        'INCORRECT_CATEGORY',
        'OTHER'
      ],
      required: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Report', reportSchema);
