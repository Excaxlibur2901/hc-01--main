import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateDoctorSession } from '../middleware/validate.js';
import { callNextToken, completeToken } from '../services/queueService.js';
import { updateAiData } from '../services/aiService.js';
import DoctorSession from '../models/DoctorSession.js';

const router = express.Router();

// POST /api/doctor/call-next — Call next patient (priority-aware)
router.post('/call-next', asyncHandler(async (req, res) => {
  const token = await callNextToken();
  res.json({ success: true, data: token });
}));

// POST /api/doctor/complete/:tokenNumber — Complete consultation
router.post('/complete/:tokenNumber', asyncHandler(async (req, res) => {
  const { tokenNumber } = req.params;
  const token = await completeToken(tokenNumber);

  // Update AI with timing data (fire-and-forget)
  updateAiData(token).catch(() => {});

  // Update doctor session stats if active session exists
  const activeSession = await DoctorSession.findOne({ isActive: true });
  if (activeSession) {
    activeSession.tokensHandled += 1;
    if (token.consultationDuration) {
      const totalTime = activeSession.avgConsultTime * (activeSession.tokensHandled - 1) + token.consultationDuration;
      activeSession.avgConsultTime = Math.round(totalTime / activeSession.tokensHandled);
    }
    await activeSession.save();
  }

  res.json({ success: true, data: token });
}));

// POST /api/doctor/session/start — Start a doctor session
router.post('/session/start', validateDoctorSession, asyncHandler(async (req, res) => {
  const { doctorName, department } = req.body;

  // End any existing active sessions
  await DoctorSession.updateMany({ isActive: true }, { isActive: false, endTime: new Date() });

  const session = await DoctorSession.create({
    doctorName,
    department: department || 'OPD',
  });

  res.status(201).json({ success: true, data: session });
}));

// POST /api/doctor/session/end — End current doctor session
router.post('/session/end', asyncHandler(async (req, res) => {
  const session = await DoctorSession.findOneAndUpdate(
    { isActive: true },
    { isActive: false, endTime: new Date() },
    { new: true }
  );

  if (!session) {
    return res.status(404).json({ success: false, error: 'No active session found' });
  }

  res.json({ success: true, data: session });
}));

// GET /api/doctor/session — Get current active session
router.get('/session', asyncHandler(async (req, res) => {
  const session = await DoctorSession.findOne({ isActive: true }).lean();
  res.json({ success: true, data: session || null });
}));

export default router;
