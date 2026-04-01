import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: {
    success: false,
    error: 'Too many requests. Please try again after 1 minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for token creation (prevent spam)
export const tokenCreationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, // Max 10 token creations per minute
  message: {
    success: false,
    error: 'Too many tokens created. Please wait before creating more.',
  },
});
