import mongoose from 'mongoose';

const emergencyCaseSchema = new mongoose.Schema({
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
  },
  patientName: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium'],
    default: 'high',
  },
  hospitalLocation: {
    lat: { type: Number, default: 28.6139 },  // Default: Delhi
    lng: { type: Number, default: 77.2090 },
  },
  suggestedHospitals: [{
    name: String,
    distance: Number,  // km
    availability: Number, // 0-100 percentage
    specialization: String,
    score: Number,
    address: String,
    phone: String,
  }],
  redirected: {
    type: Boolean,
    default: false,
  },
  selectedHospital: {
    name: String,
    distance: Number,
    address: String,
  },
}, {
  timestamps: true,
});

emergencyCaseSchema.index({ createdAt: -1 });

export default mongoose.model('EmergencyCase', emergencyCaseSchema);
