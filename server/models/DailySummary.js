import mongoose from 'mongoose';

const dailySummarySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true,
  },
  department: {
    type: String,
    default: 'OPD',
  },
  totalTokens: { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
  totalCancelled: { type: Number, default: 0 },
  totalEmergencies: { type: Number, default: 0 },
  avgWaitTime: { type: Number, default: 0 },    // minutes
  avgConsultTime: { type: Number, default: 0 },  // minutes
  maxWaitTime: { type: Number, default: 0 },
  minWaitTime: { type: Number, default: 0 },
  peakHour: { type: Number, default: null },     // 0-23
  peakHourCount: { type: Number, default: 0 },
  hourlyBreakdown: [{
    hour: Number,     // 0-23
    tokensIssued: Number,
    completed: Number,
    avgWait: Number,
  }],
}, {
  timestamps: true,
});

export default mongoose.model('DailySummary', dailySummarySchema);
