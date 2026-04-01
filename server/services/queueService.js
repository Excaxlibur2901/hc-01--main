import Token from '../models/Token.js';
import QueueState from '../models/QueueState.js';
import { getIO } from '../socketHandler.js';

const getToday = () => new Date().toISOString().split('T')[0];

// ── Helper: Get current daily state ──
const getQueueState = async (date) => {
  const targetDate = date || getToday();
  let state = await QueueState.findOne({ date: targetDate, department: 'OPD' });
  if (!state) {
    state = await QueueState.create({ 
      date: targetDate, 
      department: 'OPD', 
      currentTokenNumber: 0,
      waitingCount: 0,
      totalTokensIssued: 0
    });
  }
  return state;
};

// ── Generate a new token (Refactored Clean Version + Advanced Features) ──
export const generateToken = async ({
  patientName,
  age,
  condition,
  priority = 'general',
  department = 'OPD',
}) => {
  const todayDate = getToday();
  
  // Map 'normal' to 'general' (schema compatibility)
  const mappedPriority = priority === 'normal' ? 'general' : priority;

  // 1. Atomic increment of token number
  const state = await QueueState.findOneAndUpdate(
    { date: todayDate, department: 'OPD' },
    { $inc: { currentTokenNumber: 1, totalTokensIssued: 1, waitingCount: 1 } },
    { upsert: true, new: true }
  );

  // 3. Calculate initial wait time estimate (needed for the create call)
  const estimatedWaitTime = await calculateWaitTime({
    priority: mappedPriority,
    createdAt: new Date(),
    sessionDate: todayDate
  });

  // 4. Save to MongoDB with requested logs
  console.log("About to save token");
  const token = await Token.create({
    tokenNumber: state.currentTokenNumber,
    patientName,
    age: age || null,
    condition: condition || '',
    priority: mappedPriority,
    department: department || 'OPD',
    status: 'waiting',
    isEmergency: mappedPriority === 'emergency',
    sessionDate: todayDate,
    estimatedWaitTime
  });

  console.log("Saved token:", token);

  // 5. Emit real-time events
  const io = getIO();
  if (io) {
    io.to('queue-room').emit('token_created', token);
    await emitQueueUpdate();
  }

  return token;
};

// ── Get active queue (Sorted by Priority & Status) ──
export const getQueue = async () => {
  const avgConsult = await getAvgConsultTime();
  const timeFactor = 1 + 0.15 * Math.sin((new Date().getHours() * Math.PI) / 12);
  const avgConsultAdjusted = Math.round(avgConsult * timeFactor);

  const tokens = await Token.find({ 
    sessionDate: getToday(), 
    status: { $in: ['waiting', 'in-progress', 'done'] } 
  }).lean().exec();

  const statusOrder = { 'in-progress': 0, 'waiting': 1, 'done': 2 };
  const priorityOrder = { 'emergency': 0, 'senior': 1, 'general': 2 };

  // Sort: In-Progress first, then by Priority, then FIFO (createdAt)
  tokens.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (a.status === 'waiting') {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Dynamic wait-time recalculation
  let waitPos = 0;
  return tokens.map(t => {
    if (t.status === 'waiting') {
      waitPos++;
      t.waitingPosition = waitPos;
      t.estimatedWaitTime = waitPos * avgConsultAdjusted;
    } else {
      t.waitingPosition = 0;
      t.estimatedWaitTime = 0;
    }
    return t;
  });
};

// ── Call next patient (Priority-Respecting Search) ──
export const callNextToken = async () => {
  const priorityOrder = ['emergency', 'senior', 'general'];
  let nextToken = null;

  for (const p of priorityOrder) {
    nextToken = await Token.findOneAndUpdate(
      { sessionDate: getToday(), status: 'waiting', priority: p },
      { status: 'in-progress', calledAt: new Date() },
      { sort: { createdAt: 1 }, new: true }
    );
    if (nextToken) break;
  }

  if (!nextToken) {
    throw new Error('No waiting patients in queue');
  }

  // Update real-time state
  const io = getIO();
  if (io) {
    io.to('queue-room').emit('patient_called', nextToken);
    await emitQueueUpdate();
  }

  return nextToken;
};

// ── Complete consultation ──
export const completeToken = async (tokenNumber) => {
  const token = await Token.findOneAndUpdate(
    { tokenNumber: Number(tokenNumber), sessionDate: getToday(), status: 'in-progress' },
    { status: 'done', completedAt: new Date() },
    { new: true }
  );

  if (!token) throw new Error('Token not found or not in-progress');

  // Log performance metrics
  if (token.calledAt) {
    token.consultationDuration = Math.round((token.completedAt - token.calledAt) / 60000);
    await token.save();
  }

  // Decr waiting count & incr completed
  await QueueState.findOneAndUpdate(
    { date: getToday(), department: 'OPD' },
    { $inc: { waitingCount: -1, totalCompleted: 1 } }
  );

  const io = getIO();
  if (io) {
    io.to('queue-room').emit('consultation_complete', token);
    await emitQueueUpdate();
  }

  return token;
};

// ── Helper: Rolling Average Consultation Time ──
let avgConsultCache = 10;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000;

export const getAvgConsultTime = async () => {
  const now = Date.now();
  if (now - cacheTimestamp < CACHE_TTL) return avgConsultCache;

  try {
    const recent = await Token.find({ status: 'done', consultationDuration: { $gt: 0 } })
      .sort({ completedAt: -1 }).limit(20).select('consultationDuration').lean();

    if (recent.length > 0) {
      const total = recent.reduce((sum, t) => sum + t.consultationDuration, 0);
      avgConsultCache = Math.round(total / recent.length);
    }
    cacheTimestamp = now;
    return avgConsultCache;
  } catch (err) {
    return avgConsultCache;
  }
};

// ── Helper: Calculate single token wait time ──
export const calculateWaitTime = async (token) => {
  const sessionDate = getToday();
  const p = token.priority || 'general';
  
  let hPriorityQuery = {};
  let sPriorityQuery = {};
  
  if (p === 'emergency') {
    sPriorityQuery = { priority: 'emergency', createdAt: { $lt: token.createdAt } };
  } else if (p === 'senior') {
    hPriorityQuery = { priority: 'emergency' };
    sPriorityQuery = { priority: 'senior', createdAt: { $lt: token.createdAt } };
  } else {
    hPriorityQuery = { priority: { $in: ['emergency', 'senior'] } };
    sPriorityQuery = { priority: 'general', createdAt: { $lt: token.createdAt } };
  }

  const waitingAhead = await Token.countDocuments({
    sessionDate, status: 'waiting',
    $or: [hPriorityQuery, sPriorityQuery].filter(q => Object.keys(q).length > 0)
  });

  const avgTime = await getAvgConsultTime();
  return waitingAhead * avgTime;
};

// ── Core Helper: Push updates to all panels ──
export const emitQueueUpdate = async () => {
  const io = getIO();
  if (io) {
    const queue = await getQueue();
    const waitStats = {
      avgWait: await getAvgConsultTime(),
      queueLength: queue.filter(t => t.status === 'waiting').length
    };
    io.to('queue-room').emit('queue_updated', queue);
    io.to('queue-room').emit('wait_time_updated', waitStats);
  }
};

// ── Extra Handlers ──
export const getTokenById = async (id) => Token.findById(id).lean();
export const cancelToken = async (id) => {
  const token = await Token.findByIdAndUpdate(id, { status: 'cancelled', cancelledAt: new Date() }, { new: true });
  await QueueState.findOneAndUpdate({ date: getToday(), department: 'OPD' }, { $inc: { waitingCount: -1, totalCancelled: 1 } });
  await emitQueueUpdate();
  return token;
};