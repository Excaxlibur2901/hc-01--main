import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: Number,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  condition: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  priority: {
    type: String,
    enum: ['emergency', 'senior', 'general'],
    default: 'general',
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'done', 'cancelled'],
    default: 'waiting',
  },
  department: {
    type: String,
    default: 'OPD',
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  estimatedWaitTime: {
    type: Number, // minutes
    default: 0,
  },
  consultationDuration: {
    type: Number, // minutes
    default: null,
  },
  calledAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  sessionDate: {
    type: String, // YYYY-MM-DD format for daily grouping
    default: () => new Date().toISOString().split('T')[0],
  },
}, {
  timestamps: true,
});

// Compound index for efficient priority-based queue queries
tokenSchema.index({ sessionDate: 1, status: 1, priority: 1, createdAt: 1 });
tokenSchema.index({ tokenNumber: 1, sessionDate: 1 }, { unique: true });
tokenSchema.index({ status: 1, createdAt: 1 });

export default mongoose.model('Token', tokenSchema);
