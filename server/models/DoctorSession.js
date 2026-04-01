import mongoose from 'mongoose';

const doctorSessionSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    default: 'OPD',
  },
  sessionDate: {
    type: String, // YYYY-MM-DD
    default: () => new Date().toISOString().split('T')[0],
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
  tokensHandled: {
    type: Number,
    default: 0,
  },
  avgConsultTime: {
    type: Number, // minutes
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

doctorSessionSchema.index({ isActive: 1 });
doctorSessionSchema.index({ sessionDate: 1 });

export default mongoose.model('DoctorSession', doctorSessionSchema);
