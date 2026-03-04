import { useEffect, useRef } from 'react';

import { REVEAL_THRESHOLD, REVEAL_ROOT_MARGIN } from '../constants';

const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible');
          observer.unobserve(element);
        }
      },
      {
        threshold: options.threshold ?? REVEAL_THRESHOLD,
        rootMargin: options.rootMargin ?? REVEAL_ROOT_MARGIN,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return elementRef;
};

export default useIntersectionObserver;
