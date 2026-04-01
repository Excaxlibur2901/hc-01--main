import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateEmergencyRedirect } from '../middleware/validate.js';
import { findNearbyHospitals, getAllNearbyHospitals } from '../services/aiService.js';
import EmergencyCase from '../models/EmergencyCase.js';

const router = express.Router();

// POST /api/emergency/redirect — AI hospital redirect suggestion
router.post('/redirect', validateEmergencyRedirect, asyncHandler(async (req, res) => {
  const { condition, patientName, lat, lng } = req.body;

  const suggestedHospitals = await findNearbyHospitals({
    condition,
    lat: lat || undefined,
    lng: lng || undefined,
  });

  // Save emergency case record
  const emergencyCase = await EmergencyCase.create({
    patientName,
    condition,
    severity: 'high',
    hospitalLocation: {
      lat: lat || 28.6139,
      lng: lng || 77.2090,
    },
    suggestedHospitals,
  });

  res.json({
    success: true,
    data: {
      caseId: emergencyCase._id,
      bestHospital: suggestedHospitals[0] || null,
      allSuggestions: suggestedHospitals,
      detectedSpecialization: suggestedHospitals[0]?.specialization || 'emergency',
    },
  });
}));

// GET /api/emergency/nearby — Get nearby hospitals
router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const hospitals = await getAllNearbyHospitals({
    lat: lat ? parseFloat(lat) : undefined,
    lng: lng ? parseFloat(lng) : undefined,
  });
  res.json({ success: true, data: hospitals });
}));

// POST /api/emergency/select — Mark a hospital as selected for redirect
router.post('/select', asyncHandler(async (req, res) => {
  const { caseId, hospitalName, hospitalDistance, hospitalAddress } = req.body;

  const emergencyCase = await EmergencyCase.findByIdAndUpdate(
    caseId,
    {
      redirected: true,
      selectedHospital: {
        name: hospitalName,
        distance: hospitalDistance,
        address: hospitalAddress,
      },
    },
    { new: true }
  );

  if (!emergencyCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }

  res.json({ success: true, data: emergencyCase });
}));

export default router;
