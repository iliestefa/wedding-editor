import { useState, useEffect } from 'react';

import { WEDDING_DATE_ISO, COUNTDOWN_INTERVAL_MS } from '../constants';
import { computeTimeRemaining } from '../utils/dateHelpers';

const useCountdown = () => {
  const targetDate = new Date(`${WEDDING_DATE_ISO}T17:00:00`);

  const [timeLeft, setTimeLeft] = useState(() => computeTimeRemaining(targetDate));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(computeTimeRemaining(targetDate));
    }, COUNTDOWN_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return timeLeft;
};

export default useCountdown;
