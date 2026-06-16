const MAX_FAILED_ATTEMPTS = 5;
const INITIAL_LOCKOUT_MINUTES = 15;
const LOCKOUT_INCREMENT_MULTIPLIER = 1.5;

export const calculateLockoutDuration = (attemptCount: number): number => {
  const baseMinutes = INITIAL_LOCKOUT_MINUTES;
  const exponent = Math.max(0, attemptCount - MAX_FAILED_ATTEMPTS);
  const totalMinutes = baseMinutes * Math.pow(LOCKOUT_INCREMENT_MULTIPLIER, exponent);
  return totalMinutes * 60 * 1000; // Convert to milliseconds
};


export const calculateLockoutUntil = (attemptCount: number): Date => {
  const duration = calculateLockoutDuration(attemptCount);
  return new Date(Date.now() + duration);
};

export const MAX_LOGIN_ATTEMPTS = MAX_FAILED_ATTEMPTS;
