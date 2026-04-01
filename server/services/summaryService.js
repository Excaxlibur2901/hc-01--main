import Token from '../models/Token.js';
import DailySummary from '../models/DailySummary.js';

const today = () => new Date().toISOString().split('T')[0];

// ── Generate or update daily summary ──
export const generateDailySummary = async (date) => {
  const targetDate = date || today();

  const tokens = await Token.find({ sessionDate: targetDate }).lean();

  if (tokens.length === 0) {
    return {
      date: targetDate,
      totalTokens: 0,
      totalCompleted: 0,
      totalCancelled: 0,
      totalEmergencies: 0,
      avgWaitTime: 0,
      avgConsultTime: 0,
      maxWaitTime: 0,
      minWaitTime: 0,
      peakHour: null,
      peakHourCount: 0,
      hourlyBreakdown: [],
    };
  }

  const completed = tokens.filter(t => t.status === 'done');
  const cancelled = tokens.filter(t => t.status === 'cancelled');
  const emergencies = tokens.filter(t => t.isEmergency);

  // Calculate wait times (time from creation to being called)
  const waitTimes = completed
    .filter(t => t.calledAt && t.createdAt)
    .map(t => (new Date(t.calledAt) - new Date(t.createdAt)) / 60000);

  const consultTimes = completed
    .filter(t => t.consultationDuration > 0)
    .map(t => t.consultationDuration);

  const avgWaitTime = waitTimes.length
    ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
    : 0;

  const avgConsultTime = consultTimes.length
    ? Math.round(consultTimes.reduce((a, b) => a + b, 0) / consultTimes.length)
    : 0;

  const maxWaitTime = waitTimes.length ? Math.round(Math.max(...waitTimes)) : 0;
  const minWaitTime = waitTimes.length ? Math.round(Math.min(...waitTimes)) : 0;

  // Hourly breakdown
  const hourCounts = {};
  tokens.forEach(t => {
    const hour = new Date(t.createdAt).getHours();
    if (!hourCounts[hour]) {
      hourCounts[hour] = { tokensIssued: 0, completed: 0, waitTimes: [] };
    }
    hourCounts[hour].tokensIssued += 1;
    if (t.status === 'done') hourCounts[hour].completed += 1;
    if (t.calledAt && t.createdAt) {
      hourCounts[hour].waitTimes.push(
        (new Date(t.calledAt) - new Date(t.createdAt)) / 60000
      );
    }
  });

  const hourlyBreakdown = Object.entries(hourCounts).map(([hour, data]) => ({
    hour: Number(hour),
    tokensIssued: data.tokensIssued,
    completed: data.completed,
    avgWait: data.waitTimes.length
      ? Math.round(data.waitTimes.reduce((a, b) => a + b, 0) / data.waitTimes.length)
      : 0,
  }));

  // Peak hour
  let peakHour = null;
  let peakHourCount = 0;
  hourlyBreakdown.forEach(h => {
    if (h.tokensIssued > peakHourCount) {
      peakHour = h.hour;
      peakHourCount = h.tokensIssued;
    }
  });

  const summary = {
    date: targetDate,
    department: 'OPD',
    totalTokens: tokens.length,
    totalCompleted: completed.length,
    totalCancelled: cancelled.length,
    totalEmergencies: emergencies.length,
    avgWaitTime,
    avgConsultTime,
    maxWaitTime,
    minWaitTime,
    peakHour,
    peakHourCount,
    hourlyBreakdown,
  };

  // Upsert daily summary
  await DailySummary.findOneAndUpdate(
    { date: targetDate },
    summary,
    { upsert: true, new: true }
  );

  return summary;
};

// ── Get summary for a specific date ──
export const getSummaryByDate = async (date) => {
  const existing = await DailySummary.findOne({ date }).lean();
  if (existing) return existing;
  return generateDailySummary(date);
};

// ── Get live stats for today ──
export const getLiveStats = async () => {
  const tokens = await Token.find({ sessionDate: today() }).lean();
  const waiting = tokens.filter(t => t.status === 'waiting').length;
  const inProgress = tokens.filter(t => t.status === 'in-progress').length;
  const completed = tokens.filter(t => t.status === 'done').length;
  const emergencies = tokens.filter(t => t.isEmergency).length;

  const consultTimes = tokens
    .filter(t => t.status === 'done' && t.consultationDuration > 0)
    .map(t => t.consultationDuration);

  const avgConsultTime = consultTimes.length
    ? Math.round(consultTimes.reduce((a, b) => a + b, 0) / consultTimes.length)
    : 10;

  return {
    date: today(),
    totalTokens: tokens.length,
    waiting,
    inProgress,
    completed,
    emergencies,
    avgConsultTime,
    avgWaitTime: waiting * avgConsultTime, // rough estimate
  };
};
