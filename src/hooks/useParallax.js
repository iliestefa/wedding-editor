import { useState, useEffect } from 'react';

import { PARALLAX_FACTOR } from '../constants';

const useParallax = () => {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    transform: `translateY(${offsetY * PARALLAX_FACTOR}px)`,
  };
};

export default useParallax;
