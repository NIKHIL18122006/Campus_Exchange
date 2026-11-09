import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                    // 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Try again later.' },
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,                              // 100 messages per minute per user
  keyGenerator: (req) => req.user.id,     // per user, not per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are sending messages too fast. Slow down.' },
});