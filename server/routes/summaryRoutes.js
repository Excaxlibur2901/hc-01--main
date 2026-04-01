import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateDailySummary, getSummaryByDate, getLiveStats } from '../services/summaryService.js';

const router = express.Router();

// GET /api/summary — Get today's live summary
router.get('/', asyncHandler(async (req, res) => {
  const stats = await getLiveStats();
  res.json({ success: true, data: stats });
}));

// GET /api/summary/daily — Generate and get today's full daily summary
router.get('/daily', asyncHandler(async (req, res) => {
  const summary = await generateDailySummary();
  res.json({ success: true, data: summary });
}));

// GET /api/summary/:date — Get summary for a specific date (YYYY-MM-DD)
router.get('/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, error: 'Date format must be YYYY-MM-DD' });
  }
  const summary = await getSummaryByDate(date);
  res.json({ success: true, data: summary });
}));

export default router;
