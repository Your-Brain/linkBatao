import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      maxlength: [60, 'Collection name cannot exceed 60 characters']
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters']
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'PRIVATE'],
      default: 'PUBLIC'
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      }
    ]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Collection', collectionSchema);
