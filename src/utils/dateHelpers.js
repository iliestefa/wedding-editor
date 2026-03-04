export const computeTimeRemaining = (targetDate) => {
  const totalSeconds = Math.max(0, Math.floor((targetDate - Date.now()) / 1000));

  if (totalSeconds === 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isExpired: false };
};
