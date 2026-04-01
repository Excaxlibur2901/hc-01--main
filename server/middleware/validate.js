import { AppError } from './errorHandler.js';

// Validate create token request
export const validateCreateToken = (req, res, next) => {
  const { patientName, priority, age } = req.body;

  if (!patientName || typeof patientName !== 'string' || patientName.trim().length === 0) {
    throw new AppError('Patient name is required', 400);
  }

  if (patientName.trim().length > 100) {
    throw new AppError('Patient name must be under 100 characters', 400);
  }

  if (priority && !['emergency', 'senior', 'general'].includes(priority)) {
    throw new AppError('Invalid priority. Must be: emergency, senior, or general', 400);
  }

  if (age !== undefined && age !== null) {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      throw new AppError('Invalid age. Must be between 0 and 150', 400);
    }
  }

  // Sanitize
  req.body.patientName = patientName.trim();
  req.body.priority = priority || 'general';
  req.body.condition = (req.body.condition || '').trim();
  req.body.isEmergency = priority === 'emergency';

  next();
};

// Validate token number param
export const validateTokenParam = (req, res, next) => {
  const { tokenNumber } = req.params;
  if (!tokenNumber || isNaN(Number(tokenNumber))) {
    throw new AppError('Invalid token number', 400);
  }
  next();
};

// Validate doctor session
export const validateDoctorSession = (req, res, next) => {
  const { doctorName } = req.body;
  if (!doctorName || typeof doctorName !== 'string' || doctorName.trim().length === 0) {
    throw new AppError('Doctor name is required', 400);
  }
  req.body.doctorName = doctorName.trim();
  next();
};

// Validate emergency redirect request
export const validateEmergencyRedirect = (req, res, next) => {
  const { condition, patientName } = req.body;
  if (!condition || condition.trim().length === 0) {
    throw new AppError('Patient condition is required for emergency redirect', 400);
  }
  if (!patientName || patientName.trim().length === 0) {
    throw new AppError('Patient name is required', 400);
  }
  next();
};
