import mongoose from 'mongoose';

const queueStateSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  department: {
    type: String,
    default: 'OPD',
  },
  currentTokenNumber: {
    type: Number,
    default: 0,
  },
  totalTokensIssued: {
    type: Number,
    default: 0,
  },
  totalCompleted: {
    type: Number,
    default: 0,
  },
  totalCancelled: {
    type: Number,
    default: 0,
  },
  avgWaitTime: {
    type: Number,
    default: 0,
  },
  peakHour: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

queueStateSchema.index({ date: 1, department: 1 }, { unique: true });

export default mongoose.model('QueueState', queueStateSchema);
