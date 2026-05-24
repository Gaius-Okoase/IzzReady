import rateLimiter from 'express-rate-limit';

export const authLimit = rateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bukkaLimit = rateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
