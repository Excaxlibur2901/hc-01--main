import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateCreateToken } from '../middleware/validate.js';
import { tokenCreationLimiter } from '../middleware/rateLimiter.js';
import {
  generateToken,
  getQueue,
  getTokenById,
  cancelToken,
} from '../services/queueService.js';

const router = express.Router();

// POST /api/tokens — Create a new token
router.post('/', tokenCreationLimiter, validateCreateToken, asyncHandler(async (req, res) => {
  const { patientName, age, condition, priority, department } = req.body;
  const token = await generateToken({ patientName, age, condition, priority, department });
  res.status(201).json({ success: true, data: token });
}));

// GET /api/tokens — Get current queue
router.get('/', asyncHandler(async (req, res) => {
  const queue = await getQueue();
  res.status(200).json({ success: true, data: queue });
}));

// GET /api/tokens/:id — Get single token
router.get('/:id', asyncHandler(async (req, res) => {
  const token = await getTokenById(req.params.id);
  res.json({ success: true, data: token });
}));

// PATCH /api/tokens/:id/cancel — Cancel a token
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const token = await cancelToken(req.params.id);
  res.json({ success: true, data: token });
}));

export default router;
